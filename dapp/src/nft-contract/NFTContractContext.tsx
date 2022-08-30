import { ethers } from "ethers";
import { isEmpty, uniq } from "lodash";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import useUser from "../account/useUser";
import isEmptyObject from "../utils/isEmptyObject";
import { abi } from "./abi";
import { NFTContractWrapper } from "./NFTContractWrapper";

export type InitProps = {
    contractAddresses: string[];
    poolContractAddress: string;
    networkId: number;
}

export type NFTContractContextType = {
    approve(nftAddress: string): Promise<void>;
    init(props: InitProps): Promise<void>;
    refreshTokenIds(onlyNftAddress?: string): Promise<void>;
    removeTokenIdsFromSession(nftAddress: string, tokenIds: number[]): void;
    addTokenIdsOnSession(nftAddress: string, tokenIds: number[]): void;
    isInitialized: boolean;
    isWalletConnected: boolean;

    walletBalance: Record<string, number>;
    walletTokenIdsInited: boolean;
    walletTokenIds: Record<string, number[]>;
    walletIsApproved: Record<string, boolean>;

    isApproving: boolean;
}

export const NFTContractContext = createContext<NFTContractContextType>(null as any);

export const NFTContractProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [wrappers, setWrappers] = useState<Record<string, NFTContractWrapper>>({});
    const [networkId, setNetworkId] = useState<number>();
    const [poolContractAddress, setPoolContractAddress] = useState<string>('');
    const [nftContractAddresses, setNftContractAddress] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletIsApproved, setWalletIsApproved] = useState<Record<string, boolean>>({});
    const [isApproving, setIsApproving] = useState(false);
    const [walletBalance, setWalletBalance] = useState<Record<string, number>>({});
    const [walletTokenIds, setWalletTokenIds] = useState<Record<string, number[]>>({});
    const [walletTokenIdsInited, setWalletTokenIdsInited] = useState<boolean>(false);
    const user = useUser();

    const walletAddress = user.account?.walletAddress;

    useEffect(() => {
        if (isInitialized && walletAddress && nftContractAddresses && networkId) {
            const wrappers: Record<string, NFTContractWrapper> = {};
            nftContractAddresses.forEach(address => {
                const contract = new ethers.Contract(address, abi, user.getSignerOrProvider(networkId));
                wrappers[address] = new NFTContractWrapper(contract);
            });

            setWrappers(wrappers);
        }
    }, [isInitialized, user, nftContractAddresses, networkId]);

    const getWalletBaseInformation = async (nftAddress: string, walletAddress: string) => {
        const [walletIsApproved, walletBalance] = await Promise.all([
            wrappers[nftAddress].getApprovedStatus(walletAddress, poolContractAddress),
            wrappers[nftAddress].getBalance(walletAddress)
        ]);

        return {
            nftAddress,
            walletBalance,
            walletIsApproved
        }
    }


    useEffect(() => {
        if (walletAddress && !isEmptyObject(wrappers)) {
            const initConnectedWallet = async () => {
                const promises = Object.keys(wrappers).map(nftAddress => {
                    return getWalletBaseInformation(nftAddress, walletAddress);
                });

                const results = await Promise.all(promises);

                const walletIsApproved: Record<string, boolean> = {};
                const walletBalance: Record<string, number> = {};
                results.forEach(item => {
                    walletIsApproved[item.nftAddress] = item.walletIsApproved;
                    walletBalance[item.nftAddress] = item.walletBalance
                });

                setWalletIsApproved(walletIsApproved);
                setWalletBalance(walletBalance);
                setWalletTokenIdsInited(false);
                setIsWalletConnected(true);
            }


            initConnectedWallet()
        } else {
            setIsWalletConnected(false);
        }
    }, [wrappers, walletAddress])

    const init = async (props: InitProps): Promise<void> => {
        try {
            const { contractAddresses, networkId, poolContractAddress } = props;

            const wrappers: Record<string, NFTContractWrapper> = {};
            contractAddresses.forEach(address => {
                const contract = new ethers.Contract(address, abi, user.getSignerOrProvider(networkId));
                wrappers[address] = new NFTContractWrapper(contract);
            });

            setWrappers(wrappers);
            setPoolContractAddress(poolContractAddress);
            setNftContractAddress(contractAddresses);
            setNetworkId(networkId);
            setIsInitialized(true);
        } catch (e) {
            console.log('Error on initializing NFT contract', e);
        }
    }
    const approve = async (nftAddress: string): Promise<void> => {
        if (isInitialized && walletAddress && wrappers[nftAddress]) {
            setIsApproving(true);
            try {
                await wrappers[nftAddress].approve(poolContractAddress);
                const newWalletIsApproved = { ...walletIsApproved };
                newWalletIsApproved[nftAddress] = true;
                setWalletIsApproved(newWalletIsApproved);
            } catch (e) {
                console.log('ERROR on approving', e);
            } finally {
                setIsApproving(false);
            }
        }
    }

    const refreshTokenIds = async (onlyNftAddress?: string): Promise<void> => {
        if (isInitialized && walletAddress && !isEmptyObject(wrappers)) {
            const nftAddresses = (onlyNftAddress) ? [onlyNftAddress] : nftContractAddresses;
            const promises = nftAddresses.map(nftAddress => {
                return wrappers[nftAddress].getTokenIds(walletAddress);
            });
            const results = await Promise.all(promises);
            const newWalletTokenIds: Record<string, number[]> = {};

            nftAddresses.forEach((nftAddress, index) => {
                newWalletTokenIds[nftAddress] = results[index];
            });

            setWalletTokenIds(newWalletTokenIds);
            setWalletTokenIdsInited(true);
        }
    }

    const addTokenIdsOnSession = (nftAddress: string, tokenIds: number[]) => {
        if (walletTokenIdsInited) {
            const newWalletTokenIds = { ...walletTokenIds };
            const newTokens = uniq([
                ...(newWalletTokenIds[nftAddress] || []),
                ...tokenIds]
            );
            newWalletTokenIds[nftAddress] = newTokens;
            setWalletTokenIds(newWalletTokenIds);

            const newWalletBalances = { ...walletBalance };
            walletBalance[nftAddress] = newTokens.length;
            setWalletBalance(newWalletBalances);;
        }
    }

    const removeTokenIdsFromSession = (nftAddress: string, tokenIds: number[]) => {
        if (walletTokenIdsInited) {
            const newWalletTokenIds = { ...walletTokenIds };
            const newTokens = (newWalletTokenIds[nftAddress] || []).filter(id => !tokenIds.includes(id));
            newWalletTokenIds[nftAddress] = newTokens;
            setWalletTokenIds(newWalletTokenIds);

            const newWalletBalances = { ...walletBalance };
            walletBalance[nftAddress] = newTokens.length;
            setWalletBalance(newWalletBalances);;
        }
    }

    const contextValue: NFTContractContextType = {
        approve,
        init,
        refreshTokenIds,
        removeTokenIdsFromSession,
        addTokenIdsOnSession,

        isInitialized,

        isWalletConnected,
        walletBalance,
        walletIsApproved,
        walletTokenIds,
        walletTokenIdsInited,

        isApproving
    }

    return (
        <NFTContractContext.Provider value={contextValue}>
            {children}
        </NFTContractContext.Provider>
    );
}