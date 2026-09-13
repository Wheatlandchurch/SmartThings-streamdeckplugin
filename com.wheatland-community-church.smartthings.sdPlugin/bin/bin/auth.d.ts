export type SmartThingsToken = {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    tokenType?: string;
    scope?: string;
    issuedAt?: number;
};
export type SmartThingsTokenResponse = Partial<SmartThingsToken> & {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
};
export type SmartThingsAuthConfig = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope?: string;
    tokenUrl?: string;
};
export declare const DEFAULT_SMARTTHINGS_SCOPE = "r:devices:* r:locations:* r:automations:*";
export declare class SmartThingsAuthService {
    private readonly config;
    constructor(config: SmartThingsAuthConfig);
    buildAuthorizationUrl(state?: string): string;
    buildTokenRequest(code: string): Record<string, string>;
    buildRefreshTokenRequest(refreshToken: string): Record<string, string>;
    normalizeToken(tokenResponse: Partial<SmartThingsTokenResponse>): SmartThingsToken;
    static isTokenExpired(token?: Partial<SmartThingsToken>): boolean;
    static refreshAccessToken(config: SmartThingsAuthConfig, refreshToken: string): Promise<SmartThingsToken>;
}
