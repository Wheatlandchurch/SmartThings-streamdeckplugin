export type SmartThingsClientConfig = {
  accessToken?: string;
  baseUrl?: string;
  locationId?: string;
};

export type AutomationSummary = {
  id: string;
  name: string;
  locationId?: string;
  status?: string;
};

export class SmartThingsClient {
  private accessToken: string;
  private readonly baseUrl: string;
  private readonly locationId?: string;

  constructor(config: SmartThingsClientConfig = {}) {
    this.accessToken = config.accessToken ?? "";
    this.baseUrl = config.baseUrl ?? "https://api.smartthings.com/v1";
    this.locationId = config.locationId;
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.accessToken) {
      return { ok: false, message: "SmartThings access token is missing." };
    }

    try {
      const locations = await this.listLocations();
      return {
        ok: true,
        message: `Connected to SmartThings. ${locations.length} location(s) available.`
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown connection error"
      };
    }
  }

  async listLocations(): Promise<Array<{ id: string; name: string }>> {
    const data = await this.request<{ items?: Array<{ locationId?: string; name?: string }> }>("/locations");
    return (data.items ?? []).map((item) => ({
      id: item.locationId ?? "",
      name: item.name ?? "Unnamed location"
    }));
  }

  async listAutomations(): Promise<AutomationSummary[]> {
    const data = await this.request<{ items?: Array<{ id?: string; name?: string; locationId?: string; status?: string }> }>("/automation/automations");

    return (data.items ?? []).map((item) => ({
      id: item.id ?? "",
      name: item.name ?? "Unnamed automation",
      locationId: item.locationId ?? this.locationId,
      status: item.status ?? "enabled"
    }));
  }

  async executeAutomation(automationId: string): Promise<{ ok: boolean; message: string }> {
    if (!automationId) {
      return { ok: false, message: "No automation selected." };
    }

    const payload = { automationId };
    const result = await this.request<{ status?: string; message?: string }>(`/automation/automations/${automationId}/execute`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return {
      ok: true,
      message: result.message ?? `Automation ${automationId} was requested.`
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error("SmartThings access token is missing.");
    }

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SmartThings API request failed (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json().catch(() => ({} as T));
    return data as T;
  }
}
