export type PiiType = 'CARD' | 'EMAIL' | 'PHONE' | 'NAME' | 'ID' | 'SECRET';
export declare class PiiEntity {
    readonly token: string;
    readonly type: PiiType;
    readonly original: string;
    constructor(token: string, type: PiiType, original: string);
}
