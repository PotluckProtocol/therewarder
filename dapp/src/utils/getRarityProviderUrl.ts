import { CollectionRarityProvider } from "../pools/PoolBaseInfo";

const getRarityProviderUrl = (provider: CollectionRarityProvider): string => {
    if (provider === 'NFTKey') {
        return 'https://nftkey.app';
    } else if (provider === 'NFTiers') {
        return 'https://nftier.tech';
    } else {
        throw new Error(`Unknown rarity provider: "${provider}"`);
    }
}

export default getRarityProviderUrl;