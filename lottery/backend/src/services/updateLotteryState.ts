import getLotteryStorage from "../storage/getLotteryStorage"
import { LotteryState, LotteryStateChange } from "../storage/LotteryItem";

const updateLotteryState = async (id: string, newState: LotteryState) => {
    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(id);
    if (lottery) {
        const stateChanges: LotteryStateChange[] = [...lottery.stateChanges];
        stateChanges.push({ newState, on: new Date().toJSON() });

        lotteryStorage.update(id, {
            currentState: newState,
            stateChanges
        });
    }
}

export default updateLotteryState;