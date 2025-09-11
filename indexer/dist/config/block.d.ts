export declare const processBlock: (blockNumber: number, addresses: string[]) => Promise<{
    address: string;
    updated_balance: string;
}[] | undefined>;
export declare const startBlockListener: (addresses: string[]) => Promise<void>;
//# sourceMappingURL=block.d.ts.map