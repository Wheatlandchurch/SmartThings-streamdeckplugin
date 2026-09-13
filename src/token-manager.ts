import { promises as fs } from "fs";
import path from "path";

import { SmartThingsToken } from "./auth";

export class SmartThingsTokenManager {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(process.cwd(), "smartthings-tokens.json");
  }

  async load(): Promise<SmartThingsToken | null> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<SmartThingsToken>;
      if (!parsed.accessToken) {
        return null;
      }
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresIn: parsed.expiresIn,
        tokenType: parsed.tokenType,
        scope: parsed.scope,
        issuedAt: parsed.issuedAt ?? Date.now()
      };
    } catch {
      return null;
    }
  }

  async save(token: SmartThingsToken): Promise<void> {
    const payload: SmartThingsToken = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: token.expiresIn,
      tokenType: token.tokenType,
      scope: token.scope,
      issuedAt: token.issuedAt ?? Date.now()
    };

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(payload, null, 2), "utf8");
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch {
      // no-op if it does not exist
    }
  }
}
