import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { PoolBaseInfo } from "./PoolBaseInfo";

export type PoolsBaseInfoContextType = {
    isLoading: boolean;
    getAll: () => PoolBaseInfo[];
    getByNftContractAddress: (contractAddress: string) => PoolBaseInfo | null;
    getByPoolContractAddress: (contractAddress: string) => PoolBaseInfo | null;
    getByPoolId: (poolId: string) => PoolBaseInfo | null;
}

export const PoolsBaseInfoContext = createContext<PoolsBaseInfoContextType>(null as any);

export const PoolsBaseInfoProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {

    const [isLoading, setIsLoading] = useState(true);
    const [poolsBaseInfo, setPoolsBaseInfo] = useState<PoolBaseInfo[]>([]);

    useEffect(() => {
        const load = async () => {
            const res = await fetch('/pools.json');
            const json = await res.json();

            setPoolsBaseInfo(json as PoolBaseInfo[]);
            setIsLoading(false);
        }

        load();
    }, []);

    const getAll = (): PoolBaseInfo[] => {
        return poolsBaseInfo;
    }

    const getByNftContractAddress = (contractAddress: string): PoolBaseInfo | null => {
        return poolsBaseInfo.find(item => Object.keys(item.nftCollections).includes(contractAddress)) || null;
    }

    const getByPoolContractAddress = (contractAddress: string): PoolBaseInfo | null => {
        return poolsBaseInfo.find(item => item.poolContractAddress === contractAddress) || null;
    }

    const getByPoolId = (poolId: string): PoolBaseInfo | null => {
        return poolsBaseInfo.find(item => item.id === poolId) || null;
    }

    const contextValue: PoolsBaseInfoContextType = {
        getByNftContractAddress,
        getByPoolContractAddress,
        getByPoolId,
        getAll,
        isLoading
    }

    return (
        <PoolsBaseInfoContext.Provider value={contextValue}>
            {children}
        </PoolsBaseInfoContext.Provider>
    );
}