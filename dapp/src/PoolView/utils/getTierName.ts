import { PoolBaseInfo } from "../../pools/PoolBaseInfo";

export const getTierName = (baseInfo: PoolBaseInfo, nftAddress: string, tierIndex: number): string => {
    return baseInfo.nftCollections[nftAddress]?.tiers[tierIndex] || tierIndex.toString();
}