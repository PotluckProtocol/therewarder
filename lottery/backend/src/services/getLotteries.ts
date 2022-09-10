import getLotteryStorage from "../storage/lottery/getLotteryStorage";
import LotteryItem from "../storage/lottery/LotteryItem";

export type GetLotteriesOpts = {
    chainId: number,
    contractAddress: string
}

const getLotteries = async (opts: GetLotteriesOpts): Promise<LotteryItem[]> => {
    const { chainId, contractAddress } = opts;
    const lotteryStorage = getLotteryStorage();
    const allLotteries = await lotteryStorage.getAll();
    return allLotteries.filter(item =>
        item.chainId === chainId && item.contractAddress === contractAddress
    );
}

export default getLotteries;