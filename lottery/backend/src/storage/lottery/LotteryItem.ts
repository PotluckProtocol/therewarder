
export type LotteryState = 'INITIAL' | 'PREPARING' | 'READY_FOR_LOTTERY' | 'DONE' | 'ERRORENOUS';

export type LotteryStateChange = {
    newState: LotteryState;
    on: string;
    error?: any;
}

type LotteryItem = {
    id: string;
    currentState: LotteryState;
    stateChanges: LotteryStateChange[];
    chainId: number;
    startFromBlock: number;
    contractAddress: string;
    description?: string;
    lottery?: {
        tickets: Record<string, number>;
        results?: string[];
    }
}

export default LotteryItem;