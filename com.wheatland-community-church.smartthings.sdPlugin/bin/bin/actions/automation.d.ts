import { KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
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
export declare class AutomationAction extends SingletonAction<Settings> {
    private clientCache;
    private contextState;
    private readonly tokenManager;
    onWillAppear(ev: WillAppearEvent<Settings>): Promise<void>;
    onWillDisappear(ev: WillDisappearEvent<Settings>): Promise<void>;
    onKeyDown(ev: KeyDownEvent<Settings>): Promise<void>;
    onSendToPlugin(ev: SendToPluginEvent<any, Settings>): Promise<void>;
    private getOrCreateClient;
    private refreshButtonState;
}
export {};
