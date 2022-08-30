import { useContext } from "react"
import { PoolBaseInfo } from "./PoolBaseInfo";
import { PoolsBaseInfoContext } from "./PoolsBaseInfoContext"

export const usePoolBaseInfo = (poolContractAddressOrId?: string): PoolBaseInfo => {
    poolContractAddressOrId = poolContractAddressOrId || '';
    const context = useContext(PoolsBaseInfoContext);
    let poolBaseInfo = null;
    if (poolContractAddressOrId?.startsWith('0x')) {
        poolBaseInfo = context.getByPoolContractAddress(poolContractAddressOrId);
    } else {
        poolBaseInfo = context.getByPoolId(poolContractAddressOrId);
    }

    if (!poolBaseInfo) {
        throw new Error(`Pool base information for ${poolContractAddressOrId} not initialized`);
    }

    return poolBaseInfo;
}