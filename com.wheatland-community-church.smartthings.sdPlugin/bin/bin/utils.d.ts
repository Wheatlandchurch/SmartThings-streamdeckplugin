export declare class ErrorHandler {
    static logError(context: string, error: unknown, action?: any): void;
    static logWarning(context: string, message: string): void;
    static logInfo(context: string, message: string): void;
    static validateSettings(settings: Record<string, unknown>, requiredFields: string[]): {
        isValid: boolean;
        missingFields: string[];
    };
}
export declare class ConnectionManager {
    private static connections;
    static getConnection(key: string): any;
    static setConnection(key: string, connection: any): void;
    static removeConnection(key: string): void;
    static cleanup(): Promise<void>;
}
export declare class RetryManager {
    static withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delayMs?: number, context?: string): Promise<T>;
}
