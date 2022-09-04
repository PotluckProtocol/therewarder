export type CollectionRarityProvider = 'NFTKey' | 'NFTiers';

export type NFTCollection = {
    name: string;
    tiers: string[];
    rarityProvider?: CollectionRarityProvider;
}

export type PoolBaseInfo = {
    id: string;
    name: string;
    coverImage: string;
    networkId: number;
    poolContractAddress: string;
    nftCollections: Record<string, NFTCollection>;
    pointDivider?: number;
}