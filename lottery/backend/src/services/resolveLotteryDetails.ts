import PoolContract from "../PoolContract";
import getLotteryStorage from "../storage/lottery/getLotteryStorage"
import { UpdateProperties } from "../storage/lottery/ILotteryStorage";
import getLotteryStateProperties from "./getLotteryStateProperties";
import updateLotteryState from "./updateLotteryState";

const resolveLotteryDetails = async (id: string) => {
    const lotteryStorage = getLotteryStorage();
    let lottery = await lotteryStorage.get(id);
    if (lottery && lottery.currentState === 'INITIAL') {
        lottery = await updateLotteryState(id, 'PREPARING');
        try {
            const contract = new PoolContract(lottery.chainId, lottery.contractAddress, lottery.startFromBlock);

            console.time('GetStakedWallets');
            const wallets = await contract.getStakedWallets();
            console.timeEnd('GetStakedWallets');

            console.time('GetWalletLevels');
            let walletLevelMap: Record<string, number> = {};
            while (wallets.length > 0) {
                const chunk = wallets.splice(0, 25);
                const map = await contract.getWalletLevels(chunk);
                walletLevelMap = { ...walletLevelMap, ...map };
            }
            console.timeEnd('GetWalletLevels');

            console.log(walletLevelMap);

            const updatedLotteryProperties: UpdateProperties = {
                ...getLotteryStateProperties(lottery, 'READY_FOR_LOTTERY'),
                lottery: {
                    tickets: walletLevelMap
                }
            }

            await lotteryStorage.update(id, updatedLotteryProperties);
        } catch (error) {
            console.log('resolveLotteryDetails error', error);
            await updateLotteryState(id, 'ERRORENOUS', error);
        }
    }
}

export default resolveLotteryDetails;