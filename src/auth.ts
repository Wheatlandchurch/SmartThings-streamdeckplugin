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

export const DEFAULT_SMARTTHINGS_SCOPE = "r:devices:* r:locations:* r:automations:*";

export class SmartThingsAuthService {
  constructor(private readonly config: SmartThingsAuthConfig) {}

  buildAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope ?? DEFAULT_SMARTTHINGS_SCOPE,
      state: state ?? "streamdeck-smartthings"
    });

    return `https://api.smartthings.com/login/oauth/authorize?${params.toString()}`;
  }

  buildTokenRequest(code: string): Record<string, string> {
    return {
      grant_type: "authorization_code",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code
    };
  }

  buildRefreshTokenRequest(refreshToken: string): Record<string, string> {
    return {
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken
    };
  }

  normalizeToken(tokenResponse: Partial<SmartThingsTokenResponse>): SmartThingsToken {
    return {
      accessToken: tokenResponse.accessToken ?? tokenResponse.access_token ?? "",
      refreshToken: tokenResponse.refreshToken ?? tokenResponse.refresh_token,
      expiresIn: tokenResponse.expiresIn ?? tokenResponse.expires_in ?? 3600,
      tokenType: tokenResponse.tokenType ?? tokenResponse.token_type ?? "Bearer",
      scope: tokenResponse.scope,
      issuedAt: tokenResponse.issuedAt ?? Date.now()
    };
  }

  static isTokenExpired(token?: Partial<SmartThingsToken>): boolean {
    if (!token?.accessToken) return true;
    if (!token.issuedAt || !token.expiresIn) return false;
    return Date.now() >= token.issuedAt + token.expiresIn * 1000;
  }

  static async refreshAccessToken(config: SmartThingsAuthConfig, refreshToken: string): Promise<SmartThingsToken> {
    const auth = new SmartThingsAuthService(config);
    const formBody = new URLSearchParams(auth.buildRefreshTokenRequest(refreshToken));
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
      throw new Error(data.error_description ?? data.error ?? "Token refresh failed");
    }

    return auth.normalizeToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
      issuedAt: Date.now()
    });
  }
}
