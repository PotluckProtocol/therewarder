// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PotluckRewarderPoolV1 is IERC721Receiver, ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    // COLLECTIONS

    struct collection {
        bool active;
        address collectionAddress;
        uint256 index;
        // Weight with 0.01 precision (100 => 1, 1000 => 10, 10000 => 100)
        uint256 weight;
        uint256 tierCount;
        uint256 totalStaked;
        // Tier index => tier multiplier (0.01 precision (100 => 1, 1000 => 10, 10000 => 100))
        mapping(uint256 => uint256) tiers;
        // TokenID => tier level
        mapping(uint256 => uint256) tiersByToken;
        // TokenID => Stake
        mapping(uint256 => stakeReceipt) receipt;
        // Wallet => tokenIDs array
        mapping(address => uint256[]) balanceOfToken;
        // Indexes of tokens in balance of tokens
        mapping(uint256 => uint256) indexOfTokenInBalanceOfToken;
    }

    address[] public collections;
    mapping(address => collection) public collectionsMap;

    bool public stakingEnabled;
    uint256 public activeToSecond;

    event NewCollectionAdded(
        address indexed contractAddress,
        uint256 blockNumber
    );

    event CollectionRemoved(
        address indexed contractAddress,
        uint256 blockNumber
    );

    // STAKE ENUMERATION
    uint256 public totalStaked;

    // Receipt for stake
    struct stakeReceipt {
        address collection;
        uint256 tokenId;
        uint256 stakedFromSecond;
        address owner;
    }

    // WALLETS
    address[] public allWallets;
    mapping(address => uint256) private allWalletIndexes;

    event NewWalletStaked(
        address indexed wallet,
        uint256 storedIndex,
        uint256 blockNumber
    );

    // LEVELING DETAILS

    // How many points per second every nft accumulate (excl extras from tier)
    uint256 public pointsPerSecondBase;
    // How many points is used as base when counting level
    uint256 public pointsPerLevelBase;

    // Wallet => stored points
    mapping(address => uint256) public totalStoredPointsByWallet;

    // STAKING

    event NftStaked(
        address indexed staker,
        address erc721TokenAddress,
        uint256 tokenId,
        uint256 blockNumber
    );

    event NftUnStaked(
        address indexed staker,
        address erc721TokenAddress,
        uint256 tokenId,
        uint256 blockNumber
    );

    modifier whenStakingEnabled() {
        require(stakingEnabled, "Staking not enabled");
        _;
    }

    modifier onlyStaker(address collectionAddress, uint256 tokenId) {
        require(
            ERC721(collectionAddress).ownerOf(tokenId) == address(this),
            "onlyStaker: Contract has  of this NFT"
        );
        require(
            collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond != 0,
            "onlyStaker: Token is not staked"
        );
        require(
            collectionsMap[collectionAddress].receipt[tokenId].owner ==
                msg.sender,
            "onlyStaker: Caller is not NFT stake owner"
        );
        _;
    }

    modifier onlyStakerOfAll(
        address collectionAddress,
        uint256[] calldata tokenIds
    ) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(
                ERC721(collectionAddress).ownerOf(tokenId) == address(this),
                "onlyStaker: Contract is not owner of this NFT"
            );
            require(
                collectionsMap[collectionAddress]
                    .receipt[tokenId]
                    .stakedFromSecond != 0,
                "onlyStaker: Token is not staked"
            );
            require(
                collectionsMap[collectionAddress].receipt[tokenId].owner ==
                    msg.sender,
                "onlyStaker: Caller is not NFT stake owner"
            );
        }
        _;
    }

    modifier requireTimeElapsed(address collectionAddress, uint256 tokenId) {
        require(
            collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond < block.timestamp,
            "requireTimeElapsed: Can not stake/unStake/harvest in same second"
        );
        _;
    }

    modifier requireActiveCollection(address collectionAddress) {
        require(
            collectionsMap[collectionAddress].active == true,
            "requireActiveCollection: NFT collection not included in this pool"
        );
        _;
    }

    modifier requireTokenToBeStaked(
        address collectionAddress,
        uint256 tokenId
    ) {
        require(
            collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond > 0,
            "Token not staked"
        );
        _;
    }

    constructor(uint256 _pointsPerLevelBase, uint256 _pointsPerSecondBase) {
        pointsPerLevelBase = _pointsPerLevelBase;
        pointsPerSecondBase = _pointsPerSecondBase;
        stakingEnabled = false;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function getOwnedTokenIds(address collectionAddress, address wallet)
        external
        view
        returns (uint256[] memory)
    {
        return collectionsMap[collectionAddress].balanceOfToken[wallet];
    }

    function stakeNFT(address collectionAddress, uint256 tokenId)
        public
        nonReentrant
        whenStakingEnabled
        requireActiveCollection(collectionAddress)
        returns (bool)
    {
        _stakeNFT(collectionAddress, tokenId);

        return true;
    }

    function stakeNFTS(address collectionAddress, uint256[] calldata tokenIds)
        public
        nonReentrant
        whenStakingEnabled
        requireActiveCollection(collectionAddress)
        returns (bool)
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _stakeNFT(collectionAddress, tokenIds[i]);
        }

        return true;
    }

    function unStakeNFT(address collectionAddress, uint256 tokenId)
        external
        nonReentrant
        requireActiveCollection(collectionAddress)
        returns (bool)
    {
        _unStakeNFT(collectionAddress, tokenId);
        return true;
    }

    function unStakeNFTS(address collectionAddress, uint256[] calldata tokenIds)
        external
        nonReentrant
        requireActiveCollection(collectionAddress)
        returns (bool)
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _unStakeNFT(collectionAddress, tokenIds[i]);
        }

        return true;
    }

    function getTotalPointsNeededForLevel(uint256 level)
        external
        view
        returns (uint256)
    {
        uint256 totalPoints = 0;
        for (uint256 i = 0; i < level; i++) {
            uint256 levelPoints = pointsPerLevelBase.mul(i + 1);
            totalPoints = totalPoints.add(levelPoints);
        }
        return totalPoints;
    }

    function getWalletLevel(address walletAddress)
        external
        view
        returns (uint256)
    {
        return _getWalletLevelInternal(walletAddress);
    }

    function getMultipleWalletLevels(address[] calldata walletAddresses)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory levels = new uint256[](walletAddresses.length);
        for (uint256 i = 0; i < walletAddresses.length; i++) {
            levels[i] = _getWalletLevelInternal(walletAddresses[i]);
        }
        return levels;
    }

    function getMultipleCollectionTierByToken(
        address collectionAddress,
        uint256[] memory tokenIds
    )
        public
        view
        requireActiveCollection(collectionAddress)
        returns (uint256[] memory)
    {
        uint256[] memory tiers = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tiers[i] = collectionsMap[collectionAddress].tiersByToken[
                tokenIds[i]
            ];
        }
        return tiers;
    }

    function getWalletPoints(address walletAddress)
        external
        view
        returns (uint256)
    {
        return _getWalletPointsInternal(walletAddress);
    }

    function getPointsForToken(address collectionAddress, uint256 tokenId)
        external
        view
        requireActiveCollection(collectionAddress)
        requireTokenToBeStaked(collectionAddress, tokenId)
        returns (uint256)
    {
        return _countActiveStakedPoints(collectionAddress, tokenId);
    }

    function getCollectionCount() public view returns (uint256) {
        return collections.length;
    }

    function getCollectionStakeReceipt(
        address collectionAddress,
        uint256 tokenId
    )
        public
        view
        requireActiveCollection(collectionAddress)
        requireTokenToBeStaked(collectionAddress, tokenId)
        returns (stakeReceipt memory)
    {
        return collectionsMap[collectionAddress].receipt[tokenId];
    }

    function getCollectionTierByToken(
        address collectionAddress,
        uint256 tokenId
    ) public view requireActiveCollection(collectionAddress) returns (uint256) {
        return collectionsMap[collectionAddress].tiersByToken[tokenId];
    }

    function getCollectionTierMultiplier(
        address collectionAddress,
        uint256 tierLevel
    ) public view requireActiveCollection(collectionAddress) returns (uint256) {
        return collectionsMap[collectionAddress].tiers[tierLevel];
    }

    function getCollectionTierMultipliers(address collectionAddress)
        public
        view
        requireActiveCollection(collectionAddress)
        returns (uint256[] memory)
    {
        uint256 tierCount = collectionsMap[collectionAddress].tierCount;
        uint256[] memory multipliers = new uint256[](tierCount);

        for (uint256 i = 0; i < tierCount; i++) {
            multipliers[i] = collectionsMap[collectionAddress].tiers[i];
        }

        return multipliers;
    }

    function getCollectionWalletTokens(
        address collectionAddress,
        address walletAddress
    )
        public
        view
        requireActiveCollection(collectionAddress)
        returns (uint256[] memory)
    {
        return collectionsMap[collectionAddress].balanceOfToken[walletAddress];
    }

    function getWalletCount() public view returns (uint256) {
        return allWallets.length;
    }

    function getStakedTimeOfTokenInSeconds(
        address collectionAddress,
        uint256 tokenId
    )
        external
        view
        requireActiveCollection(collectionAddress)
        requireTokenToBeStaked(collectionAddress, tokenId)
        returns (uint256)
    {
        return
            block.timestamp.sub(
                collectionsMap[collectionAddress]
                    .receipt[tokenId]
                    .stakedFromSecond
            );
    }

    function isRewardingEnabled() public view returns (bool) {
        return activeToSecond == 0;
    }

    // ADMIN ONLY

    function enableRewarding() external onlyOwner {
        activeToSecond = 0;
    }

    function disableRewarding() external onlyOwner {
        activeToSecond = block.timestamp;
    }

    function setStakingEnabled(bool value) external onlyOwner {
        stakingEnabled = value;
    }

    function removeCollection(address collectionAddress)
        external
        onlyOwner
        requireActiveCollection(collectionAddress)
    {
        require(
            collectionsMap[collectionAddress].totalStaked == 0,
            "Cannot remove colletion as there is staked tokens"
        );

        uint256 toBeRemovedIndex = collectionsMap[collectionAddress].index;
        uint256 lastIndexInArray = collections.length - 1;
        address toBeRemovedItem = collections[toBeRemovedIndex];
        address lastItemOnArray = collections[lastIndexInArray];

        collections[toBeRemovedIndex] = lastItemOnArray;
        collections[lastIndexInArray] = toBeRemovedItem;
        collections.pop();

        delete collectionsMap[collectionAddress];

        emit CollectionRemoved(collectionAddress, block.number);
    }

    function addCollection(
        address collectionAddress,
        uint256 weight100based,
        uint256[] memory tierLevel100BasedMultipliers
    ) external onlyOwner {
        require(
            collectionsMap[collectionAddress].active == false,
            "Cannot add same collection twice"
        );

        _setupTiers(collectionAddress, tierLevel100BasedMultipliers);

        uint256 nextCollectionsIndex = collections.length;

        collectionsMap[collectionAddress].active = true;
        collectionsMap[collectionAddress].collectionAddress = collectionAddress;
        collectionsMap[collectionAddress].weight = weight100based;
        collectionsMap[collectionAddress].index = nextCollectionsIndex;

        collections.push(collectionAddress);

        emit NewCollectionAdded(collectionAddress, block.number);
    }

    function setTokenRarityTiers(
        address collectionAddress,
        uint256[] calldata tokenIds,
        uint256[] calldata tokenIdTiers
    ) external onlyOwner requireActiveCollection(collectionAddress) {
        require(
            tokenIds.length == tokenIdTiers.length,
            "Tokenids length did not match tiers length"
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tierLevel = tokenIdTiers[i];
            _requireTierLevelExists(collectionAddress, tierLevel);
            collectionsMap[collectionAddress].tiersByToken[
                tokenIds[i]
            ] = tierLevel;
        }
    }

    function setPointsPerSecondBase(uint256 _pointsPerSecondBase)
        external
        onlyOwner
    {
        pointsPerSecondBase = _pointsPerSecondBase;
    }

    function setPointsPerLevelBase(uint256 _pointsPerLevelBase)
        external
        onlyOwner
    {
        pointsPerLevelBase = _pointsPerLevelBase;
    }

    function modifyCollectionWeight(
        address collectionAddress,
        uint256 newWeight100Based
    ) external onlyOwner requireActiveCollection(collectionAddress) {
        collectionsMap[collectionAddress].weight = newWeight100Based;
    }

    function modifyTierMultiplier(
        address collectionAddress,
        uint256 tierLevel,
        uint256 newMultiplier100Based
    ) external onlyOwner requireActiveCollection(collectionAddress) {
        _requireTierLevelExists(collectionAddress, tierLevel);
        _modifyTierMultiplier(
            collectionAddress,
            tierLevel,
            newMultiplier100Based
        );
    }

    function addExtraPointsToWallet(address walletAddress, uint256 points)
        external
        onlyOwner
    {
        totalStoredPointsByWallet[walletAddress] += points;
    }

    // @dev Escape hatch if someone sends funds into contract
    function withdrawBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    // @dev Escape hatch if someone sends any ERC20 token into contract
    function withdrawERC20Tokens(address tokenAddress) external onlyOwner {
        IERC20 erc20Token = ERC20(tokenAddress);
        erc20Token.transfer(msg.sender, erc20Token.balanceOf(address(this)));
    }

    // @dev Escape hatch if someone sends any other than stakeable ERC721 into contract
    function withdrawERC721Token(address tokenAddress, uint256 tokenId)
        external
        onlyOwner
    {
        require(
            collectionsMap[tokenAddress].active == false,
            "Cannot withdraw stakeable nft tokens"
        );

        ERC721(tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }

    // @dev Return given tokenid into its owners wallet
    function adminSupport(address collectionAddress, uint256 tokenId)
        external
        onlyOwner
        nonReentrant
        requireActiveCollection(collectionAddress)
        returns (bool)
    {
        address tokenOwner = collectionsMap[collectionAddress]
            .receipt[tokenId]
            .owner;
        _removeFromStakedMappings(collectionAddress, tokenId, tokenOwner);

        // Send token back to its owners wallet
        ERC721(collectionAddress).safeTransferFrom(
            address(this),
            tokenOwner,
            tokenId
        );
        emit NftUnStaked(tokenOwner, collectionAddress, tokenId, block.number);

        return true;
    }

    // INTERNALS

    function _requireTierLevelExists(
        address collectionAddress,
        uint256 tierLevel
    ) internal view {
        require(
            tierLevel <= collectionsMap[collectionAddress].tierCount - 1,
            "No such tier"
        );
    }

    function _stakeNFT(address collectionAddress, uint256 tokenId)
        internal
        returns (bool)
    {
        require(
            collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond == 0,
            "Stake: Token is already staked"
        );

        ERC721 erc721Token = ERC721(collectionAddress);
        require(
            erc721Token.ownerOf(tokenId) != address(this),
            "Stake: Token is already staked in this contract"
        );
        erc721Token.safeTransferFrom(msg.sender, address(this), tokenId);
        require(
            erc721Token.ownerOf(tokenId) == address(this),
            "Stake: Failed to take possession of NFT"
        );

        _addUniqueWallet(msg.sender);
        _addToStakedMappings(collectionAddress, tokenId);

        emit NftStaked(msg.sender, collectionAddress, tokenId, block.number);
        return true;
    }

    function _unStakeNFT(address collectionAddress, uint256 tokenId)
        internal
        onlyStaker(collectionAddress, tokenId)
        requireTimeElapsed(collectionAddress, tokenId)
        returns (bool)
    {
        _removeFromStakedMappings(collectionAddress, tokenId, msg.sender);

        ERC721(collectionAddress).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
        emit NftUnStaked(msg.sender, collectionAddress, tokenId, block.number);
        return true;
    }

    function _addToStakedMappings(address collectionAddress, uint256 tokenId)
        internal
    {
        uint256 newIndex = collectionsMap[collectionAddress]
            .balanceOfToken[msg.sender]
            .length;
        collectionsMap[collectionAddress].balanceOfToken[msg.sender].push(
            tokenId
        );
        collectionsMap[collectionAddress].indexOfTokenInBalanceOfToken[
                tokenId
            ] = newIndex;

        collectionsMap[collectionAddress]
            .receipt[tokenId]
            .collection = collectionAddress;
        collectionsMap[collectionAddress].receipt[tokenId].tokenId = tokenId;
        collectionsMap[collectionAddress].receipt[tokenId].owner = msg.sender;
        collectionsMap[collectionAddress]
            .receipt[tokenId]
            .stakedFromSecond = block.timestamp;

        collectionsMap[collectionAddress].totalStaked += 1;
        // Increase totalStaked counter
        totalStaked += 1;
    }

    function _removeFromStakedMappings(
        address collectionAddress,
        uint256 tokenId,
        address tokenOwner
    ) internal {
        uint256 toBeRemovedIndex = collectionsMap[collectionAddress]
            .indexOfTokenInBalanceOfToken[tokenId];
        uint256 lastIndex = collectionsMap[collectionAddress]
            .balanceOfToken[tokenOwner]
            .length - 1;

        // Swap toBeRemoved with the item on last index of an array and update indexes
        if (toBeRemovedIndex != lastIndex) {
            uint256 lastIndexTokenId = collectionsMap[collectionAddress]
                .balanceOfToken[tokenOwner][lastIndex];

            collectionsMap[collectionAddress].balanceOfToken[tokenOwner][
                    toBeRemovedIndex
                ] = lastIndexTokenId;
            collectionsMap[collectionAddress].balanceOfToken[tokenOwner][
                    lastIndex
                ] = tokenId;

            collectionsMap[collectionAddress].indexOfTokenInBalanceOfToken[
                    lastIndexTokenId
                ] = toBeRemovedIndex;
            collectionsMap[collectionAddress].indexOfTokenInBalanceOfToken[
                    tokenId
                ] = lastIndex;
        }

        // Remove tokenId index mapping and pop out the last cell from the array
        delete collectionsMap[collectionAddress].indexOfTokenInBalanceOfToken[
            tokenId
        ];
        collectionsMap[collectionAddress].balanceOfToken[tokenOwner].pop();

        uint256 tokenPoints = _countActiveStakedPoints(
            collectionAddress,
            tokenId
        );

        // Store in storage how many seconds this token has been staked in overall
        totalStoredPointsByWallet[
            collectionsMap[collectionAddress].receipt[tokenId].owner
        ] += tokenPoints;

        // Remove also receipt
        delete collectionsMap[collectionAddress].receipt[tokenId];

        // Decrease total staked count
        collectionsMap[collectionAddress].totalStaked -= 1;
        totalStaked -= 1;
    }

    function _getWalletPointsInternal(address walletAddress)
        internal
        view
        returns (uint256)
    {
        uint256 totalPoints = 0;
        for (uint256 i = 0; i < collections.length; i++) {
            totalPoints = totalPoints.add(
                _getWalletPointsForCollection(collections[i], walletAddress)
            );
        }

        // Add extra points
        totalPoints = totalPoints.add(totalStoredPointsByWallet[walletAddress]);

        return totalPoints;
    }

    function _getWalletLevelInternal(address walletAddress)
        internal
        view
        returns (uint256)
    {
        if (_isActiveWallet(walletAddress)) {
            return _getLevel(_getWalletPointsInternal(walletAddress));
        } else {
            return 0;
        }
    }

    function _getLevel(uint256 points) internal view returns (uint256) {
        uint256 runningLevel = 1;
        uint256 totalPointsConsumed = 0;
        while (true) {
            uint256 neededPointsForNextLevel = runningLevel.mul(
                pointsPerLevelBase
            );
            uint256 pointsLeft = points.sub(totalPointsConsumed);

            if (pointsLeft < neededPointsForNextLevel) {
                break;
            }

            totalPointsConsumed += neededPointsForNextLevel;
            runningLevel += 1;
        }

        return runningLevel;
    }

    function _getWalletPointsForCollection(
        address collectionAddress,
        address walletAddress
    ) internal view returns (uint256) {
        uint256[] memory walletTokenIds = collectionsMap[collectionAddress]
            .balanceOfToken[walletAddress];
        uint256 currentlyAccumulatedPoints = 0;
        for (uint256 i = 0; i < walletTokenIds.length; i++) {
            currentlyAccumulatedPoints = currentlyAccumulatedPoints.add(
                _countActiveStakedPoints(collectionAddress, walletTokenIds[i])
            );
        }

        return currentlyAccumulatedPoints;
    }

    function _countActiveStakedPoints(
        address collectionAddress,
        uint256 tokenId
    ) internal view returns (uint256) {
        if (
            collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond > 0
        ) {
            uint256 fromSecond = collectionsMap[collectionAddress]
                .receipt[tokenId]
                .stakedFromSecond;
            uint256 toSecond = _getStakedTo();
            uint256 stakedSeconds = toSecond.sub(fromSecond);

            uint256 multipliedPointsForCounting = pointsPerSecondBase.mul(100);

            uint256 pointsPerSecond = multipliedPointsForCounting
                .mul(_getTierMultiplier(collectionAddress, tokenId))
                .div(100);

            uint256 weightAdjustedPointsPerSecond = pointsPerSecond
                .mul(collectionsMap[collectionAddress].weight)
                .div(100);

            return stakedSeconds.mul(weightAdjustedPointsPerSecond).div(100);
        } else {
            return 0;
        }
    }

    function _getStakedTo() internal view returns (uint256) {
        if (activeToSecond > 0 && block.timestamp > activeToSecond) {
            return activeToSecond;
        } else {
            return block.timestamp;
        }
    }

    function _getTierMultiplier(address collectionAddress, uint256 tokenId)
        internal
        view
        returns (uint256)
    {
        return
            collectionsMap[collectionAddress].tiers[
                collectionsMap[collectionAddress].tiersByToken[tokenId]
            ];
    }

    function _setupTiers(
        address collectionAddress,
        uint256[] memory tierLevelMultipliers
    ) internal {
        require(
            tierLevelMultipliers.length > 0,
            "At least one tier level must be set"
        );

        collectionsMap[collectionAddress].tierCount = tierLevelMultipliers
            .length;

        for (uint256 index = 0; index < tierLevelMultipliers.length; index++) {
            _modifyTierMultiplier(
                collectionAddress,
                index,
                tierLevelMultipliers[index]
            );
        }
    }

    function _modifyTierMultiplier(
        address collectionAddress,
        uint256 tierLevel,
        uint256 multiplier
    ) internal {
        require(
            multiplier >= 1 && multiplier <= 10000,
            "Multiplier must be between 1 and 10000"
        );

        collectionsMap[collectionAddress].tiers[tierLevel] = multiplier;
    }

    function _isActiveWallet(address walletAddress)
        internal
        view
        returns (bool)
    {
        return
            allWalletIndexes[walletAddress] > 0 ||
            (allWallets.length > 0 && allWallets[0] == walletAddress);
    }

    function _addUniqueWallet(address walletAddress) internal {
        if (_isActiveWallet(walletAddress)) {
            return;
        }

        uint256 nextIndex = allWallets.length;
        allWalletIndexes[walletAddress] = nextIndex;
        allWallets.push(walletAddress);

        emit NewWalletStaked(msg.sender, nextIndex, block.number);
    }
}
