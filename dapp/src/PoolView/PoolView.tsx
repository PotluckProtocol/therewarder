import React from 'react';
import { useSearchParams } from "react-router-dom";
import { NFTContractProvider } from "../nft-contract/NFTContractContext";
import { LevelingPoolContractProvider } from "../pools/leveling/LevelingPoolContractContext";
import { usePoolBaseInfo } from "../pools/usePoolBaseInfo";
import PoolInternal from "./PoolInternal";

const PoolView: React.FC = () => {

    const [searchParams] = useSearchParams();
    const poolId = searchParams.get('id');
    const poolInfo = usePoolBaseInfo(poolId || '');

    return (
        <NFTContractProvider>
            <LevelingPoolContractProvider>
                <PoolInternal poolInfo={poolInfo} />
            </LevelingPoolContractProvider>
        </NFTContractProvider>
    );
}

export default PoolView;
