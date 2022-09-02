import getLotteryStorage from "../storage/getLotteryStorage"
import LotteryItem from "../storage/LotteryItem";

export type CreateNewLotteryOpts = {
    chainId: number,
    contractAddress: string;
    description?: string;
}

const createNewLottery = async (opts: CreateNewLotteryOpts): Promise<string> => {
    const lotteryStorage = getLotteryStorage();

    const newLottery: Omit<LotteryItem, 'id'> = {
        ...opts,
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