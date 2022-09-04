import { PoolBaseInfo } from "./PoolBaseInfo";

const getNftContractAddresses = (poolInfo: PoolBaseInfo): string[] => {
    return Object.keys(poolInfo.nftCollections);
}

export default getNftContractAddresses;