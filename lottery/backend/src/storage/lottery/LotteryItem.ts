
export type LotteryState = 'INITIAL' | 'PREPARING' | 'READY_FOR_LOTTERY' | 'DONE' | 'ERRORENOUS';

export type LotteryStateChange = {
    newState: LotteryState;
    on: string;
    error?: any;
}

export type LotterySpec = {
    tickets: Record<string, number>;
    results?: string[];
}

type LotteryItem = {
    id: string;
    currentState: LotteryState;
    stateChanges: LotteryStateChange[];
    chainId: number;
    startFromBlock: number;
    contractAddress: string;
    description?: string;
    lottery?: LotterySpec;
}

export default LotteryItem;