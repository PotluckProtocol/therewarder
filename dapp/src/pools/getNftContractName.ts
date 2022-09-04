import { PoolBaseInfo } from "./PoolBaseInfo";

const getNftContractName = (poolInfo: PoolBaseInfo, nftAddress: string): string => {
    return (poolInfo.nftCollections[nftAddress] || {}).name || '';
}

export default getNftContractName;