import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { NetworkIcon } from "../components/NetworkIcon";
import ProgressBar from "../components/ProgressBar";
import { RoundedButton } from "../components/RoundedButton";
import { TextFit } from "../components/TextFit";
import getNftContractAddresses from "../pools/getNftContractAddresses";
import { LevelingPoolContractContext } from "../pools/leveling/LevelingPoolContractContext";
import { PoolBaseInfo } from "../pools/PoolBaseInfo";
import getRarityProviderUrl from "../utils/getRarityProviderUrl";
import { StakingPopup } from "./StakingPopup";
import countPointsPerDay from "./utils/countPointsPerDay";
import { getTierName } from "./utils/getTierName";

export type PoolInternalWalletOnlyProps = {
    poolInfo: PoolBaseInfo;
    walletAddress: string;
}

const Container = styled.div`
    width: 95%;
    max-width: 768px;
    border: 3px solid #5dffff;
    background-color: rgba(0,0,0,0.75);
    border-radius: .5rem;
    rgba(93,255,255,0.4) 1px 1px 15px 1px;
`;

const PoolName = styled(TextFit)`
    font-family: Backbones;
    color: white;
`;

const PoolImage = styled.img`
    max-width: 200px;
    border-radius: 50%;
    box-shadow: #5dffff 1px 1px 18px 1px
`;

const Content = styled.div`
    width: 100%;
`;

const LevelText = styled.div`
    font-family: Akira;
    color: white;
    font-size: 1.1rem;
    text-transform: uppercase;

    & span {
        color: #5dffff;
        font-size: 1.5rem;
    }
`;

const Subtitle = styled.h2`
    font-size: 1.5rem;
    color: White;
    font-family: Akira;
`;

const CollectionContainer = styled.div`
    padding: 1rem;
    border: 2px solid  #5dffff;
    border-radius: .5rem;
    background-color: #000;
`;

const CollectionName = styled.h3`
    font-family: Akira;
    font-size: 1.25rem;
    color: White;
    font-weight: 600;
`;

const Table = styled.table`
    color: white;
    width: 100%;
    text-align: left;
    font-size: .9rem;

    th {
        font-size: .75rem;
    }

    tr {
        border-bottom: 2px solid #670512;
    }
`;

const BackToListingButton = styled(RoundedButton)`
    box-shadow: rgb(0 0 0 / 50%) 1px 1px 10px 1px;
`;

const ActionButton = styled(RoundedButton)``;

const CollectionButton = styled(ActionButton)`
    font-size: .75rem;
`;

const NotConnected = styled.div`
    text-align: center;
    margin-top: 4rem;
`;

const PositionedNetworkIcon = styled(NetworkIcon)`
    position: absolute;
    top: -0.25rem;
    left: 0;
`;

const WrongNetwork = styled.div`
    color: white;
    font-size: .85rem;
`;

const RarityProviderText = styled.div`
    color: white;
    font-size: .85rem;
`;

const RarityProviderLink = styled.a`
    color: #5dffff;
    font-weight: 600;
`;

const PoolInternalWalletOnly: React.FC<PoolInternalWalletOnlyProps> = ({
    poolInfo,
    walletAddress
}) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeNftContractAddress, setActiveNftContractAddress] = useState<string>('');
    const poolContractContext = useContext(LevelingPoolContractContext);
    const navigate = useNavigate();
    const nftContractAddresses = getNftContractAddresses(poolInfo);

    useEffect(() => {
        const init = async () => {
            try {
                await poolContractContext.init(poolInfo, walletAddress);
            } catch (e) {
                console.log('Pool Contract init failed', poolInfo.name, e);
                throw e;
            }
        }

        init();
    }, []);

    if (!poolContractContext?.isInitialized) {
        return <>Loading</>;
    }


    const renderTableBody = (nftAddress: string) => {
        let content: React.ReactNode;

        const tokens = poolContractContext.walletTokens.filter(item => item.nftContract === nftAddress);

        if (tokens.length > 0) {
            content = tokens.map(token => {
                const pointsPerDay = poolContractContext.fixPoints(
                    countPointsPerDay([token.tierIndex], poolContractContext.pointCalculationDetails[nftAddress])
                );

                return (
                    <tr key={token.tokenId}>
                        <td>#{token.tokenId}</td>
                        <td>{getTierName(poolInfo, token.nftContract, token.tierIndex)}</td>
                        <td>{pointsPerDay.toFixed(2)}</td>
                    </tr>
                );
            });
        } else {
            content = (
                <tr>
                    <td className="text-center" colSpan={3}>No staked tokens</td>
                </tr>
            )
        }
        return (
            <tbody>{content}</tbody>
        );
    }

    const renderProgressBar = () => {
        const fixPoints = (p: number): number => Math.floor(p / (poolInfo.pointDivider || 1))

        const { walletPoints, currentLevelPointBoundary, nextLevelPointBoundary } = poolContractContext;
        const value = walletPoints - currentLevelPointBoundary;
        const max = nextLevelPointBoundary - currentLevelPointBoundary;
        return (
            <ProgressBar value={fixPoints(value)} min={0} max={fixPoints(max)} />
        );
    }

    const renderRarityProvider = (nftAddress: string) => {
        const collection = poolInfo.nftCollections[nftAddress];
        if (collection && collection.rarityProvider) {
            const url = getRarityProviderUrl(collection.rarityProvider);
            return (
                <RarityProviderText className='mt-2'>
                    Rarity brought to you by: <RarityProviderLink href={url} target="_blank">{collection.rarityProvider}</RarityProviderLink>.
                </RarityProviderText>
            );
        }
    }

    const handleCloseStaking = () => {
        setActiveNftContractAddress('');
        setIsPopupOpen(false);
    }

    return (
        <>
            <div className='mt-16 mb-12 flex justify-center'>
                <BackToListingButton onClick={() => navigate('/')}>
                    Return to pool listing
                </BackToListingButton>
            </div>

            <Container className='mx-auto mt-16 p-4'>
                <PoolName className="mb-6 px-4 text-center md:text-left" height={50}>{poolInfo.name}</PoolName>
                <div className='block md:flex'>
                    <div className="md:mr-8 my-8 md:my-0 relative">
                        <PositionedNetworkIcon networkId={poolInfo.networkId} size={50} />
                        <PoolImage className="mx-auto md:mx-0 " src={poolInfo.coverImage} />
                    </div>

                    <Content>
                        <LevelText>Wallet level <span>{poolContractContext.walletLevel}</span></LevelText>

                        {renderProgressBar()}

                        <div className='mt-6'>
                            <Subtitle>Collection Stats</Subtitle>

                            {nftContractAddresses.map(nftAddress => {
                                const nftAddressName = poolInfo.nftCollections[nftAddress].name;
                                return (
                                    <CollectionContainer className="mt-6" key={nftAddress}>
                                        <CollectionName className='mb-2'>{nftAddressName}</CollectionName>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>Token #</th>
                                                    <th>Tier</th>
                                                    <th>Points / day</th>
                                                </tr>
                                            </thead>
                                            {renderTableBody(nftAddress)}
                                        </Table>

                                        {renderRarityProvider(nftAddress)}

                                    </CollectionContainer>
                                )
                            })}
                        </div>
                    </Content>
                </div>
            </Container >

            {isPopupOpen && (
                <StakingPopup
                    nftContractAddress={activeNftContractAddress}
                    poolBaseInfo={poolInfo}
                    onClose={handleCloseStaking}
                />
            )}
        </>
    );
}

export default PoolInternalWalletOnly;
