import PoolContract from "../PoolContract";
import getLotteryStorage from "../storage/getLotteryStorage"
import updateLotteryState from "./updateLotteryState";

const resolveLotteryDetails = async (id: string) => {
    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(id);
    if (lottery && lottery.currentState === 'INITIAL') {
        await updateLotteryState(id, 'PREPARING');
        try {
            const contract = new PoolContract(lottery.chainId, lottery.contractAddress);


            await updateLotteryState(id, 'READY_FOR_LOTTERY');
        } catch (e) {
            await updateLotteryState(id, 'ERRORENOUS');
        }

    }
}

export default resolveLotteryDetails;