
export type LotteryState = 'INITIAL' | 'PREPARING' | 'READY_FOR_LOTTERY' | 'DONE' | 'ERRORENOUS';

export type LotteryStateChange = {
    newState: LotteryState;
    on: string;
}

type LotteryItem = {
    id: string;
    currentState: LotteryState;
    stateChanges: LotteryStateChange[];
    contractAddress: string;
    description?: string;
    chainId: number;
    lottery?: {
        tickets: Record<string, number>;
        results: string[];
    }
}

export default LotteryItem;