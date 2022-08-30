import { ethers } from "ethers";
import EventEmitter from "events";
import SimpleCache from "../../utils/simpleCache";

export type Opts = {
    stakeGas?: number;
    unStakeGas?: number;
    harvestGas?: number;
}

export type PointCalculationDetails = {
    pointsBasePerSecond: number;
    weight: number;
    tierMultipliers: number[];
}

const pointCalculationDetailsCache = new SimpleCache<PointCalculationDetails>();
const tokenTierCache = new SimpleCache<number>();

export class PoolContractWrapper extends EventEmitter {

    constructor(
        private poolContract: ethers.Contract
    ) {
        super();
    }

    public async getPointCalculationDetails(nftAddress: string): Promise<PointCalculationDetails> {
        const cacheKey = `${nftAddress}-details`;
        const cacheHit = pointCalculationDetailsCache.get(cacheKey);
        if (cacheHit) {
            return cacheHit;
        }

        const [pointsPerSecondBase, collectionDetails] = await Promise.all([
            this.poolContract.pointsPerSecondBase(),
            this.poolContract.collectionsMap(nftAddress)
        ]);

        const tierMultiplierPromises = Array(Number(collectionDetails.tierCount))
            .fill('')
            .map((_, index) => this.poolContract.getCollectionTierMultiplier(nftAddress, index));
        const tierMultipliers = (await Promise.all(tierMultiplierPromises)).map(Number);

        const item: PointCalculationDetails = {
            pointsBasePerSecond: Number(pointsPerSecondBase),
            weight: Number(collectionDetails.weight),
            tierMultipliers
        }

        pointCalculationDetailsCache.add(cacheKey, { ...item });

        return item;
    }

    public async getTotalStaked(): Promise<number> {
        const res = await this.poolContract.totalStaked();
        return Number(res);
    }

    public async getBalance(nftAddress: string, wallet: string): Promise<number> {
        const ids = await this.getTokenIdsInternal(nftAddress, wallet);
        return ids.length;
    }

    public async getTokenIds(nftAddress: string, wallet: string): Promise<number[]> {
        const ids = await this.getTokenIdsInternal(nftAddress, wallet);
        return ids.map(Number);
    }

    public async getTokenTiers(nftAddress: string, tokenIds: number[]): Promise<number[]> {
        const tiers = await Promise.all(
            tokenIds.map(id => this.getTokenTierInternal(nftAddress, id))
        );
        return tiers;
    }

    public async getTotalPointsNeededForLevel(level: number) {
        const points = await this.poolContract.getTotalPointsNeededForLevel(level);
        return Number(points);
    }

    public async getWalletPoints(wallet?: string): Promise<number> {
        if (!wallet) {
            return 0;
        }

        const points = await this.poolContract.getWalletPoints(wallet);
        return Number(points);
    }

    public async getWalletLevel(wallet?: string): Promise<number> {
        if (!wallet) {
            return 0;
        }

        const level = await this.poolContract.getWalletLevel(wallet);
        return Number(level);

    }

    public async isRewardingEnabled(): Promise<boolean> {
        return this.poolContract.isRewardingEnabled();
    }

    public async isStakingEnabled(): Promise<boolean> {
        return this.poolContract.stakingEnabled();
    }

    public async stakeNfts(nftAddress: string, tokenIds: number[]): Promise<void> {
        await this.waitForTx(this.poolContract.stakeNFTS(nftAddress, tokenIds));
    }

    public async unStakeNfts(nftAddress: string, tokenIds: number[]): Promise<void> {
        await this.waitForTx(this.poolContract.unStakeNFTS(nftAddress, tokenIds));
    }

    private async getTokenIdsInternal(nftAddress: string, wallet: string): Promise<string[]> {
        return this.poolContract.getOwnedTokenIds(nftAddress, wallet);
    }

    private async waitForTx(promise: Promise<any>) {
        const tx = await promise;
        await tx.wait();
    }

    private async getTokenTierInternal(nftAddress: string, tokenId: number): Promise<number> {
        const cacheKey = `${nftAddress}-${tokenId}`;
        const cacheHit = tokenTierCache.get(cacheKey);
        if (typeof cacheHit === 'number') {
            return cacheHit;
        }

        const res = await this.poolContract.getCollectionTierByToken(nftAddress, tokenId);
        const numeric = Number(res);
        tokenTierCache.add(cacheKey, numeric);
        return numeric;
    }

}
