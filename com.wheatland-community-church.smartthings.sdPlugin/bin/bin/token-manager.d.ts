import { SmartThingsToken } from "./auth";
export declare class SmartThingsTokenManager {
    private readonly filePath;
    constructor(filePath?: string);
    load(): Promise<SmartThingsToken | null>;
    save(token: SmartThingsToken): Promise<void>;
    clear(): Promise<void>;
}
