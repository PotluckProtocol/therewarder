import { PoolBaseInfo } from "./PoolBaseInfo";

const getNftContractName = (poolInfo: PoolBaseInfo, nftAddress: string): string => {
    const nftNames = poolInfo.nftContractNames || {};
    return nftNames[nftAddress] || '';
}

export default getNftContractName;