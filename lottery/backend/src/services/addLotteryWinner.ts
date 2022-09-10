import getLotteryStorage from "../storage/lottery/getLotteryStorage";
import LotteryItem, { LotterySpec } from "../storage/lottery/LotteryItem";

const addLotteryWinner = async (id: string, newWinner: string): Promise<LotteryItem> => {
    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(id);
    if (lottery) {
        const newLotterySpec: LotterySpec = { ...lottery.lottery } as LotterySpec;
        newLotterySpec.results = [...(newLotterySpec.results || []), newWinner];
        await lotteryStorage.update(id, { lottery: newLotterySpec });
    }
    const updatedLottery = await lotteryStorage.get(id);
    return updatedLottery as LotteryItem;
}

export default addLotteryWinner;