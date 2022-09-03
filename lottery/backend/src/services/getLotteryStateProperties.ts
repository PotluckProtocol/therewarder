import LotteryItem, { LotteryState, LotteryStateChange } from "../storage/lottery/LotteryItem";

const getLotteryStateProperties = (
    lottery: LotteryItem,
    newState: LotteryState,
    error?: any
): Pick<LotteryItem, 'currentState' | 'stateChanges'> => {
    const stateChanges: LotteryStateChange[] = [...lottery.stateChanges];
    stateChanges.push({ newState, on: new Date().toJSON(), error });
    return {
        currentState: newState,
        stateChanges
    }

}

export default getLotteryStateProperties;