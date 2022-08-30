export type PoolBaseInfo = {
    id: string;
    name: string;
    networkId: number;
    coverImage: string;
    nftContractAddress: string | string[];
    poolContractAddress: string;
    tiers?: { [address: string]: string[] };
    nftContractNames?: { [address: string]: string };
    pointDivider?: number;
}