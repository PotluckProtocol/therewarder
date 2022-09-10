import { BigNumber, Contract, ethers } from "ethers";
import getPoolAbi from "./utils/getPoolAbi";
import getProviderForChain from "./utils/getProviderForChain";

const NEW_WALLET_STAKED_EVENT = 'NewWalletStaked';
const MAX_EVENTS_PER_REQUEST = 2040;

class PoolContract {

    private contract: Contract;

    constructor(chainId: number, contractAddress: string, private fromBlock: number) {
        this.contract = new Contract(contractAddress, getPoolAbi(), getProviderForChain(chainId));
    }

    public async getStakedWallets(): Promise<string[]> {
        console.time('getStakedWallets');
        const currentBlock = await this.contract.provider.getBlockNumber();
        const wallets: string[] = [];

        const addWalletsFromEvents = (events: ethers.Event[]): void => {
            wallets.push(
                ...events
                    .map(event => event.args?.wallet)
                    .filter(Boolean)
            );
        }

        let from = this.fromBlock;
        while (from < currentBlock) {
            const to = Math.min(from + MAX_EVENTS_PER_REQUEST, currentBlock);
            const events = await this.contract.queryFilter(NEW_WALLET_STAKED_EVENT, from, to);
            addWalletsFromEvents(events);
            from = to;
        }

        return wallets;
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