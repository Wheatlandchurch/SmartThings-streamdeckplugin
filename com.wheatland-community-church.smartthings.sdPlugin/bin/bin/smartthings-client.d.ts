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
export declare class SmartThingsClient {
    private accessToken;
    private readonly baseUrl;
    private readonly locationId?;
    constructor(config?: SmartThingsClientConfig);
    setAccessToken(accessToken: string): void;
    testConnection(): Promise<{
        ok: boolean;
        message: string;
    }>;
    listLocations(): Promise<Array<{
        id: string;
        name: string;
    }>>;
    listAutomations(): Promise<AutomationSummary[]>;
    executeAutomation(automationId: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    private request;
}
