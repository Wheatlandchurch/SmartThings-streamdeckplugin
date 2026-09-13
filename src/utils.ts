import streamDeck from "@elgato/streamdeck";

export class ErrorHandler {
  static logError(context: string, error: unknown, action?: any): void {
    const message = error instanceof Error ? error.message : String(error);
    streamDeck.logger.error(`[${context}] ${message}`);
    if (action) {
      action.showAlert().catch(() => undefined);
    }
  }

  static logWarning(context: string, message: string): void {
    streamDeck.logger.warn(`[${context}] ${message}`);
  }

  static logInfo(context: string, message: string): void {
    streamDeck.logger.info(`[${context}] ${message}`);
  }

  static validateSettings(settings: Record<string, unknown>, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      if (!settings[field]) {
        missingFields.push(field);
      }
    }
    return { isValid: missingFields.length === 0, missingFields };
  }
}

export class ConnectionManager {
  private static connections: Map<string, any> = new Map();

  static getConnection(key: string): any {
    return this.connections.get(key);
  }

  static setConnection(key: string, connection: any): void {
    this.connections.set(key, connection);
  }

  static removeConnection(key: string): void {
    const connection = this.connections.get(key);
    if (connection && typeof connection.disconnect === "function") {
      connection.disconnect();
    }
    this.connections.delete(key);
  }

  static async cleanup(): Promise<void> {
    for (const [key, connection] of this.connections.entries()) {
      if (connection && typeof connection.disconnect === "function") {
        try {
          connection.disconnect();
        } catch (error) {
          ErrorHandler.logError(`ConnectionManager:${key}`, error);
        }
      }
    }
    this.connections.clear();
  }
}

export class RetryManager {
  static async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000, context = "operation"): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        ErrorHandler.logWarning(context, `Attempt ${attempt}/${maxRetries} failed: ${error}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }
}
