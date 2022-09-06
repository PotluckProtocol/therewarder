import React from 'react';
import { useSearchParams } from "react-router-dom";
import { NFTContractProvider } from "../nft-contract/NFTContractContext";
import { LevelingPoolContractProvider } from "../pools/leveling/LevelingPoolContractContext";
import { usePoolBaseInfo } from "../pools/usePoolBaseInfo";
import PoolInternal from "./PoolInternal";
import PoolInternalWalletOnly from './PoolInternalWalletOnly';

const PoolView: React.FC = () => {

    const [searchParams] = useSearchParams();
    const poolId = searchParams.get('id');
    const walletOnly = searchParams.get('inspectWallet');
    const poolInfo = usePoolBaseInfo(poolId || '');

    const renderInternal = () => {
        console.log('walletOnly', walletOnly);
        if (walletOnly) {
            return <PoolInternalWalletOnly poolInfo={poolInfo} walletAddress={walletOnly} />;
        } else {
            return <PoolInternal poolInfo={poolInfo} />;
        }
    }

    return (
        <NFTContractProvider>
            <LevelingPoolContractProvider>
                {renderInternal()}
            </LevelingPoolContractProvider>
        </NFTContractProvider>
    );
}

export default PoolView;
