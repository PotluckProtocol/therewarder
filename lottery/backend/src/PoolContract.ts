import { BigNumber, Contract, ethers, utils } from "ethers";
import getPoolAbi from "./utils/getPoolAbi";
import getProviderForChain from "./utils/getProviderForChain";

const NEW_WALLET_STAKED_EVENT = 'NewWalletStaked';
const STAKED_EVENT = 'NftStaked';
const UNSTAKED_EVENT = 'NftUnStaked';
const MAX_EVENTS_PER_REQUEST = 2040;

class PoolContract {

    private contract: Contract;

    constructor(chainId: number, contractAddress: string, private fromBlock: number) {
        this.contract = new Contract(contractAddress, getPoolAbi(), getProviderForChain(chainId));
    }

    public async getStakedWallets(): Promise<string[]> {
        console.time('getStakedWallets');
        const currentBlock = await this.contract.provider.getBlockNumber();
        const allEvents: utils.LogDescription[] = [];
        let from = this.fromBlock;
        while (from < currentBlock) {
            const to = Math.min(from + MAX_EVENTS_PER_REQUEST, currentBlock);
            // const events = await this.contract.queryFilter(NEW_WALLET_STAKED_EVENT, from, to);
            //addWalletsFromEvents(events);

            const newWalletStaked = this.contract.filters[NEW_WALLET_STAKED_EVENT]?.();
            const nftStaked = this.contract.filters[STAKED_EVENT]?.();
            const nftUnStaked = this.contract.filters[UNSTAKED_EVENT]?.();

            const logs = await this.contract.provider.getLogs({
                address: this.contract.address,
                topics: [
                    (newWalletStaked?.topics || [])[0],
                    (nftStaked?.topics || [])[0],
                    (nftUnStaked?.topics || [])[0],
                ].filter(Boolean)
            });


            const parsed = logs.map(log => this.contract.interface.parseLog(log));
            if (parsed.length) {
                console.log(parsed[0]);
            }
            allEvents.push(
                ...parsed
            );

            from = to;
        }

        return this.getStakedWalletsFromEvents(allEvents);
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

    private getStakedWalletsFromEvents(events: utils.LogDescription[]): string[] {

        const wallets: string[] = [];
        const stakedIdsPerWalletMap: { [wallet: string]: string[] } = {};

        for (const event of events) {
            if (event.topic === NEW_WALLET_STAKED_EVENT) {
                wallets.push(event.args[0]);
            } else if (event.topic === STAKED_EVENT) {
                const [staker, collectionAddr, tokenId] = event.args;
                stakedIdsPerWalletMap[staker].push(`${collectionAddr}_${tokenId}`);
            } else if (event.topic === UNSTAKED_EVENT) {
                const [staker, collectionAddr, tokenId] = event.args;
                const index = (stakedIdsPerWalletMap[staker] || []).findIndex(item => item === `${collectionAddr}_${tokenId}`);
                if (index > -1) {
                    stakedIdsPerWalletMap[staker].splice(index, 1);
                }
            }
        }

        const currentlyHasStake = Object.keys(stakedIdsPerWalletMap).filter(wallet => {
            const tokens = stakedIdsPerWalletMap[wallet];
            return (tokens.length > 0);
        });


        console.log(`Total staked wallets ${wallets.length}. Without currently staked NFTS: ${wallets.length - currentlyHasStake.length}.`);

        return currentlyHasStake;
    }

}

export default PoolContract;