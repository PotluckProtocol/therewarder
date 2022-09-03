import getLotteryStorage from "../storage/lottery/getLotteryStorage"
import LotteryItem from "../storage/lottery/LotteryItem";
import getInitialBlockForChain from "../utils/getInitialBlockForChain";

export type CreateNewLotteryOpts = {
    chainId: number,
    contractAddress: string;
    description?: string;
    startFromBlock?: number;
}

const createNewLottery = async (opts: CreateNewLotteryOpts): Promise<string> => {
    const lotteryStorage = getLotteryStorage();
    const { startFromBlock, ...restOpts } = opts;
    const newLottery: Omit<LotteryItem, 'id'> = {
        ...restOpts,
        startFromBlock: startFromBlock || getInitialBlockForChain(opts.chainId),
        currentState: 'INITIAL',
        stateChanges: [{
            newState: 'INITIAL',
            on: new Date().toJSON()
        }]
    }

    const newLotteryId = await lotteryStorage.create(newLottery);

    return newLotteryId;
}

export default createNewLottery;