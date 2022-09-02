import { BigNumber, Contract } from "ethers";
import getPoolAbi from "./utils/getPoolAbi";
import getProviderForChain from "./utils/getProviderForChain";

class PoolContract {

    private contract: Contract;

    constructor(chainId: number, contractAddress: string) {
        this.contract = new Contract(contractAddress, getPoolAbi(), getProviderForChain(chainId));
    }

    public async getWalletCount(): Promise<number> {
        const walletCount: BigNumber = await this.contract.getWalletCount();
        return walletCount.toNumber();
    }

    public async getWalletFromIndex(index: number): Promise<string> {
        return this.contract.allWallets(index);
    }

    public async getWalletLevels(walletAddresses: string[]): Promise<{ [address: string]: number }> {
        const walletLevelMap: { [address: string]: number } = {};
        const walletLevels: BigNumber[] = await this.contract.getMultipleWalletLevels(walletAddresses);
        walletAddresses.forEach((address, index) => {
            walletLevelMap[address] = walletLevels[index].toNumber();
        });

        return walletLevelMap;
    }

}

export default PoolContract;