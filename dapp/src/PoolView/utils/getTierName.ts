import { PoolBaseInfo } from "../../pools/PoolBaseInfo";

export const getTierName = (baseInfo: PoolBaseInfo, nftAddress: string, tierIndex: number): string => {
    return baseInfo.tiers?.[nftAddress]?.[tierIndex] || tierIndex.toString();
}