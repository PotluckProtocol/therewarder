import getLotteryStorage from "../storage/lottery/getLotteryStorage";
import LotteryItem, { LotteryState } from "../storage/lottery/LotteryItem";
import getLotteryStateProperties from "./getLotteryStateProperties";

const updateLotteryState = async (id: string, newState: LotteryState, error?: any): Promise<LotteryItem> => {
    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(id);
    if (lottery) {
        await lotteryStorage.update(id, getLotteryStateProperties(lottery, newState, error));
    }
    const updatedLottery = await lotteryStorage.get(id);
    return updatedLottery as LotteryItem;
}

export default updateLotteryState;