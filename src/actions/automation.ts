import streamDeck, {
  action,
  KeyDownEvent,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent
} from "@elgato/streamdeck";

import { SmartThingsAuthService } from "../auth";
import { SmartThingsClient } from "../smartthings-client";
import { SmartThingsTokenManager } from "../token-manager";
import { ErrorHandler } from "../utils";

type Settings = {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  accessToken?: string;
  refreshToken?: string;
  locationId?: string;
  automationId?: string;
  automationName?: string;
  baseUrl?: string;
};

type ContextState = {
  action: any;
  accessToken: string;
  refreshToken?: string;
  locationId?: string;
  automationId?: string;
  automationName?: string;
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
};

@action({ UUID: "com.wheatland-community-church.smartthings.automation" })
export class AutomationAction extends SingletonAction<Settings> {
  private clientCache: Map<string, SmartThingsClient> = new Map();
  private contextState: Map<string, ContextState> = new Map();
  private readonly tokenManager = new SmartThingsTokenManager();

  override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    const persisted = await this.tokenManager.load();
    const settings = {
      ...ev.payload.settings,
      accessToken: ev.payload.settings.accessToken ?? persisted?.accessToken ?? "",
      refreshToken: ev.payload.settings.refreshToken ?? persisted?.refreshToken ?? "",
      baseUrl: ev.payload.settings.baseUrl ?? "https://api.smartthings.com/v1",
      automationName: ev.payload.settings.automationName ?? "Choose automation"
    };

    await ev.action.setSettings(settings);

    const currentSettings = await ev.action.getSettings();
    const nextState: ContextState = {
      action: ev.action,
      accessToken: currentSettings.accessToken ?? "",
      refreshToken: currentSettings.refreshToken,
      locationId: currentSettings.locationId,
      automationId: currentSettings.automationId,
      automationName: currentSettings.automationName ?? "Choose automation",
      baseUrl: currentSettings.baseUrl ?? "https://api.smartthings.com/v1",
      clientId: currentSettings.clientId,
      clientSecret: currentSettings.clientSecret,
      redirectUri: currentSettings.redirectUri
    };

    this.contextState.set(ev.action.id, nextState);
    await this.refreshButtonState(ev.action.id);
  }

  override async onWillDisappear(ev: WillDisappearEvent<Settings>): Promise<void> {
    this.contextState.delete(ev.action.id);
  }

  override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    const state = this.contextState.get(ev.action.id);
    if (!state) {
      streamDeck.logger.error("Missing context state for SmartThings action");
      await ev.action.showAlert();
      return;
    }

    const settings = await ev.action.getSettings();
    const automationId = settings.automationId;
    const accessToken = settings.accessToken ?? state.accessToken;

    if (!accessToken) {
      await ev.action.showAlert();
      ErrorHandler.logWarning("AutomationAction", "No SmartThings access token configured.");
      return;
    }

    if (!automationId) {
      await ev.action.showAlert();
      ErrorHandler.logWarning("AutomationAction", "No SmartThings automation selected.");
      return;
    }

    const client = this.getOrCreateClient(accessToken, settings.baseUrl ?? state.baseUrl, settings.locationId ?? state.locationId);

    try {
      const result = await client.executeAutomation(automationId);
      if (result.ok) {
        await ev.action.showOk();
        await ev.action.setState(1);
        await ev.action.setTitle(state.automationName ?? "Automation");
      } else {
        await ev.action.showAlert();
      }
    } catch (error) {
      ErrorHandler.logError("AutomationAction", error, ev.action);
      await ev.action.showAlert();
    }
  }

  override async onSendToPlugin(ev: SendToPluginEvent<any, Settings>): Promise<void> {
    const payload = ev.payload as any;

    if (payload.action === "authorize") {
      const auth = new SmartThingsAuthService({
        clientId: payload.clientId ?? "",
        clientSecret: payload.clientSecret ?? "",
        redirectUri: payload.redirectUri ?? "https://localhost",
        scope: payload.scope
      });

      streamDeck.ui.sendToPropertyInspector({
        event: "authUrl",
        authUrl: auth.buildAuthorizationUrl(payload.state)
      });
      return;
    }

    if (payload.action === "refreshToken") {
      try {
        const refreshToken = payload.refreshToken ?? "";
        const clientId = payload.clientId ?? "";
        const clientSecret = payload.clientSecret ?? "";

        if (!refreshToken || !clientId || !clientSecret) {
          throw new Error("Refresh token, client ID, and client secret are required.");
        }

        const token = await SmartThingsAuthService.refreshAccessToken(
          { clientId, clientSecret, redirectUri: payload.redirectUri ?? "https://localhost" },
          refreshToken
        );

        await this.tokenManager.save(token);

        streamDeck.ui.sendToPropertyInspector({
          event: "tokenSaved",
          success: true,
          message: "SmartThings token refreshed successfully."
        });
      } catch (error) {
        streamDeck.ui.sendToPropertyInspector({
          event: "tokenSaved",
          success: false,
          message: error instanceof Error ? error.message : "Failed to refresh SmartThings token"
        });
      }
      return;
    }

    if (payload.action === "exchangeCode") {
      try {
        const auth = new SmartThingsAuthService({
          clientId: payload.clientId ?? "",
          clientSecret: payload.clientSecret ?? "",
          redirectUri: payload.redirectUri ?? "https://localhost",
          scope: payload.scope
        });

        const formBody = new URLSearchParams(auth.buildTokenRequest(payload.code));
        const response = await fetch("https://api.smartthings.com/login/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
          },
          body: formBody.toString()
        });

        const data = (await response.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
          token_type?: string;
          scope?: string;
          error?: string;
          error_description?: string;
        };

        if (!response.ok) {
          throw new Error(data.error_description ?? data.error ?? "Token exchange failed");
        }

        const token = auth.normalizeToken({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          token_type: data.token_type,
          scope: data.scope,
          issuedAt: Date.now()
        });

        await this.tokenManager.save(token);

        streamDeck.ui.sendToPropertyInspector({
          event: "tokenSaved",
          success: true,
          message: "SmartThings token saved successfully."
        });
      } catch (error) {
        streamDeck.ui.sendToPropertyInspector({
          event: "tokenSaved",
          success: false,
          message: error instanceof Error ? error.message : "Failed to exchange SmartThings token"
        });
      }
      return;
    }

    if (payload.action === "loadAutomations") {
      try {
        const accessToken = payload.accessToken ?? "";
        const baseUrl = payload.baseUrl ?? "https://api.smartthings.com/v1";
        const locationId = payload.locationId ?? "";

        if (!accessToken) {
          throw new Error("Access token is missing.");
        }

        const client = new SmartThingsClient({ accessToken, baseUrl, locationId });
        const automations = await client.listAutomations();

        streamDeck.ui.sendToPropertyInspector({
          event: "automationList",
          automations,
          success: true
        });
      } catch (error) {
        streamDeck.ui.sendToPropertyInspector({
          event: "automationList",
          success: false,
          message: error instanceof Error ? error.message : "Unable to load automations"
        });
      }
      return;
    }

    if (payload.action === "testConnection") {
      const accessToken = payload.accessToken ?? "";
      const baseUrl = payload.baseUrl ?? "https://api.smartthings.com/v1";
      const locationId = payload.locationId ?? "";

      try {
        const client = new SmartThingsClient({ accessToken, baseUrl, locationId });
        const result = await client.testConnection();

        streamDeck.ui.sendToPropertyInspector({
          event: "connectionTestResult",
          success: result.ok,
          message: result.message
        });
      } catch (error) {
        streamDeck.ui.sendToPropertyInspector({
          event: "connectionTestResult",
          success: false,
          message: error instanceof Error ? error.message : "Unable to connect to SmartThings"
        });
      }
    }
  }

  private getOrCreateClient(accessToken: string, baseUrl: string, locationId?: string): SmartThingsClient {
    const key = `${baseUrl}:${locationId ?? "default"}`;
    if (!this.clientCache.has(key)) {
      const client = new SmartThingsClient({ accessToken, baseUrl, locationId });
      this.clientCache.set(key, client);
    }

    const client = this.clientCache.get(key)!;
    client.setAccessToken(accessToken);
    return client;
  }

  private async refreshButtonState(contextId: string): Promise<void> {
    const state = this.contextState.get(contextId);
    if (!state) return;

    const label = state.automationId ? (state.automationName ?? "Automation") : "Select automation";
    await state.action.setTitle(label);
    await state.action.setState(0);
  }
}
