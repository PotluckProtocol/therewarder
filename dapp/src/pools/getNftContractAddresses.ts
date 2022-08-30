import { PoolBaseInfo } from "./PoolBaseInfo";

const getNftContractAddresses = (poolInfo: PoolBaseInfo): string[] => {
    return Array.isArray(poolInfo.nftContractAddress) ? poolInfo.nftContractAddress : [poolInfo.nftContractAddress];
}

export default getNftContractAddresses;