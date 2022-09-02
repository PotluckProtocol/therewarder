export type Abi = any;

const POOL_ABI: Abi = [{ "inputs": [{ "internalType": "uint256", "name": "_pointsPerLevelBase", "type": "uint256" }, { "internalType": "uint256", "name": "_pointsPerSecondBase", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "contractAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "CollectionRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "contractAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "NewCollectionAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "wallet", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "storedIndex", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "NewWalletStaked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "address", "name": "erc721TokenAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "NftStaked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "address", "name": "erc721TokenAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "NftUnStaked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "activeToSecond", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "weight100based", "type": "uint256" }, { "internalType": "uint256[]", "name": "tierLevel100BasedMultipliers", "type": "uint256[]" }], "name": "addCollection", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }, { "internalType": "uint256", "name": "points", "type": "uint256" }], "name": "addExtraPointsToWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "adminSupport", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "allWallets", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "collections", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "collectionsMap", "outputs": [{ "internalType": "bool", "name": "active", "type": "bool" }, { "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "uint256", "name": "weight", "type": "uint256" }, { "internalType": "uint256", "name": "tierCount", "type": "uint256" }, { "internalType": "uint256", "name": "totalStaked", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "disableRewarding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "enableRewarding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getCollectionCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getCollectionStakeReceipt", "outputs": [{ "components": [{ "internalType": "address", "name": "collection", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "stakedFromSecond", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }], "internalType": "struct PotluckRewarderPoolV1.stakeReceipt", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getCollectionTierByToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tierLevel", "type": "uint256" }], "name": "getCollectionTierMultiplier", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }], "name": "getCollectionTierMultipliers", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "address", "name": "walletAddress", "type": "address" }], "name": "getCollectionWalletTokens", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }], "name": "getMultipleCollectionTierByToken", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "walletAddresses", "type": "address[]" }], "name": "getMultipleWalletLevels", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "address", "name": "wallet", "type": "address" }], "name": "getOwnedTokenIds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getPointsForToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getStakedTimeOfTokenInSeconds", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "level", "type": "uint256" }], "name": "getTotalPointsNeededForLevel", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getWalletCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }], "name": "getWalletLevel", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }], "name": "getWalletPoints", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isRewardingEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "newWeight100Based", "type": "uint256" }], "name": "modifyCollectionWeight", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tierLevel", "type": "uint256" }, { "internalType": "uint256", "name": "newMultiplier100Based", "type": "uint256" }], "name": "modifyTierMultiplier", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC721Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pointsPerLevelBase", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pointsPerSecondBase", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }], "name": "removeCollection", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pointsPerLevelBase", "type": "uint256" }], "name": "setPointsPerLevelBase", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pointsPerSecondBase", "type": "uint256" }], "name": "setPointsPerSecondBase", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "value", "type": "bool" }], "name": "setStakingEnabled", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "tokenIdTiers", "type": "uint256[]" }], "name": "setTokenRarityTiers", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "stakeNFT", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }], "name": "stakeNFTS", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "stakingEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalStaked", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "totalStoredPointsByWallet", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "unStakeNFT", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "collectionAddress", "type": "address" }, { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }], "name": "unStakeNFTS", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }], "name": "withdrawERC20Tokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "withdrawERC721Token", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const getPoolAbi = (): Abi => {
    return POOL_ABI;
}

export default getPoolAbi;