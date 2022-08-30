import { ethers } from "ethers";
import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import useUser from "../../account/useUser";
import useInterval from "../..//hooks/useInterval";
import { PoolBaseInfo } from "../PoolBaseInfo";
import { abi } from "./abi";
import { PointCalculationDetails, PoolContractWrapper } from "./LevelingPoolContractWrapper";
import getNftContractAddresses from "../getNftContractAddresses";

export type PoolState = 'NotResolved' | 'NotStarted' | 'Active' | 'Ended';

export type Token = {
    nftContract: string;
    tokenId: number;
    tierIndex: number;
}

export type LevelingPoolContractContextType = {
    isInitialized: boolean;
    walletTokens: Token[];
    isLoadingTokenIds: boolean;
    isStaking: boolean;
    isUnstaking: boolean;
    poolState: PoolState;
    walletPoints: number;
    walletLevel: number;
    totalStaked: number;
    currentLevelPointBoundary: number;
    nextLevelPointBoundary: number;
    pointCalculationDetails: Record<string, PointCalculationDetails>;
    init(poolBaseInfo: PoolBaseInfo): void;
    retrieveTokens(): Promise<void>;
    stakeNfts(nftAddress: string, tokenIds: number[]): Promise<void>;
    unstakeNfts(nftAddress: string, tokenIds: number[]): Promise<void>;
    createTokens(nftAddress: string, tokenIds: number[]): Promise<Token[]>;
    fixPoints(points: number): number;
}

export const LevelingPoolContractContext = createContext<LevelingPoolContractContextType>(null as any);

export const LevelingPoolContractProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [poolBaseInfo, setPoolBaseInfo] = useState<PoolBaseInfo>();
    const [isInitialized, setIsInitialized] = useState(false);
    const [wrapper, setWrapper] = useState<PoolContractWrapper>();
    const [walletTokens, setWalletTokens] = useState<Token[]>([]);
    const [pointCalculationDetails, setPointCalculationDetails] = useState<Record<string, PointCalculationDetails>>({});
    const [isLoadingTokenIds, setIsLoadingTokenIds] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
    const [isUnstaking, setIsUnstaking] = useState(false);
    const [totalStaked, setTotalStaked] = useState(0);
    const [poolState, setPoolState] = useState<PoolState>('NotResolved');
    const [walletPoints, setWalletPoints] = useState<number>(0);
    const [walletLevel, setWalletLevel] = useState<number>(0);
    const [thisLevelPoints, setThisLevelPoints] = useState<number>(0);
    const [nextLevelPoints, setNextLevelPoints] = useState<number>(0);
    const user = useUser();
    const walletAddress = user.account?.walletAddress;

    useEffect(() => {
        if (isInitialized && poolBaseInfo) {
            const contract = new ethers.Contract(poolBaseInfo.poolContractAddress, abi, user.getSignerOrProvider(poolBaseInfo.networkId));
            const wrapper = new PoolContractWrapper(contract);
            setWrapper(wrapper);
            intervalBeat(wrapper, walletAddress);
            retrieveTokens();
        }
    }, [isInitialized, user, poolBaseInfo]);

    async function intervalBeat(
        wrapper: PoolContractWrapper,
        walletAddress?: string
    ): Promise<void> {

        if (!poolBaseInfo) {
            return;
        }

        const promises: [Promise<boolean>, Promise<number>, Promise<number>] = [
            wrapper.isRewardingEnabled(),
            wrapper.getWalletLevel(walletAddress),
            wrapper.getWalletPoints(walletAddress)
        ];

        const [isRewardingEnabled, newLevel, points] = await Promise.all(promises);
        const state = isRewardingEnabled ? 'NotStarted' : 'Active';

        const oldLevel = walletLevel;
        setPoolState(state);
        setWalletLevel(newLevel);
        setWalletPoints(points);

        if (newLevel > 0 && oldLevel !== newLevel) {
            const [thisLevelPoints, nextLevelPoints] = await Promise.all([
                wrapper.getTotalPointsNeededForLevel(newLevel - 1),
                wrapper.getTotalPointsNeededForLevel(newLevel)
            ]);
            setThisLevelPoints(thisLevelPoints);
            setNextLevelPoints(nextLevelPoints);
        }
    }

    useInterval(() => {
        if (wrapper) {
            intervalBeat(wrapper, walletAddress);
        }
    }, 5000);

    async function init(poolBaseInfo: PoolBaseInfo): Promise<void> {
        try {
            const contract = new ethers.Contract(poolBaseInfo.poolContractAddress, abi, user.getSignerOrProvider(poolBaseInfo.networkId));
            const wrapper = new PoolContractWrapper(contract);
            const nftContractAddresses = getNftContractAddresses(poolBaseInfo);
            const [_, totalStaked, ...pointCalcDetailResults] = await Promise.all([
                intervalBeat(wrapper, walletAddress),
                wrapper.getTotalStaked(),
                ...nftContractAddresses.map(nftAddress => wrapper.getPointCalculationDetails(nftAddress))
            ]);

            const newPointCalculationDetails: Record<string, PointCalculationDetails> = {};
            nftContractAddresses.forEach((address, index) => {
                newPointCalculationDetails[address] = pointCalcDetailResults[index];
            });

            setPointCalculationDetails(newPointCalculationDetails);
            setWrapper(wrapper);
            setPoolBaseInfo(poolBaseInfo);
            setTotalStaked(totalStaked);
            setIsInitialized(true);
        } catch (e) {
            console.log('Failed when contacting contract on pool init', e);
            throw e;
        }
    }

    async function retrieveTokens(): Promise<void> {
        if (wrapper && walletAddress && poolBaseInfo) {
            setIsLoadingTokenIds(true);
            try {
                const nftContractAddresses = getNftContractAddresses(poolBaseInfo);

                const tokenResults = await Promise.all(
                    nftContractAddresses.map(async (nftAddress) => {
                        const tokenIds = await wrapper.getTokenIds(nftAddress, walletAddress);
                        const tokens = await createTokens(nftAddress, tokenIds);
                        return tokens;
                    })
                );

                setWalletTokens(tokenResults.flatMap(token => token));
            } finally {
                setIsLoadingTokenIds(false);
            }
        }
    }

    async function stakeNfts(nftAddress: string, tokenIds: number[]): Promise<void> {
        setIsStaking(true);
        if (wrapper && walletAddress && poolBaseInfo) {
            try {
                await wrapper.stakeNfts(nftAddress, tokenIds);
                const newTokens = await createTokens(nftAddress, tokenIds);
                setWalletTokens([...walletTokens, ...newTokens]);
            } finally {
                setIsStaking(false);
            }
        }
    }

    async function unstakeNfts(nftAddress: string, tokenIds: number[]): Promise<void> {
        if (wrapper && walletAddress && poolBaseInfo) {
            setIsUnstaking(true);
            try {
                await wrapper.unStakeNfts(nftAddress, tokenIds);
                /** @todo FIXME when multi nft address support per pool! */
                setWalletTokens(walletTokens.filter(token => !tokenIds.includes(token.tokenId)));
            } finally {
                setIsUnstaking(false);
            }
        }
    }

    async function createTokens(nftAddress: string, tokenIds: number[]): Promise<Token[]> {
        if (wrapper && poolBaseInfo) {
            const tiers = await wrapper.getTokenTiers(nftAddress, tokenIds);
            return tokenIds.map((tokenId, index) => ({
                tokenId,
                tierIndex: tiers[index],
                nftContract: nftAddress
            }));
        } else {
            return [];
        }
    }

    function fixPoints(points: number): number {
        if (poolBaseInfo?.pointDivider) {
            return Math.floor(points / poolBaseInfo.pointDivider);
        } else {
            return points;
        }
    }

    const contextValue: LevelingPoolContractContextType = {
        isInitialized,
        walletTokens,
        isLoadingTokenIds,
        isStaking,
        isUnstaking,
        poolState,
        totalStaked,

        pointCalculationDetails,
        walletLevel,
        walletPoints,
        nextLevelPointBoundary: nextLevelPoints,
        currentLevelPointBoundary: thisLevelPoints,

        init,
        retrieveTokens,
        stakeNfts,
        unstakeNfts,
        createTokens,
        fixPoints
    }

    return (
        <LevelingPoolContractContext.Provider value={contextValue}>
            {children}
        </LevelingPoolContractContext.Provider>
    );
}