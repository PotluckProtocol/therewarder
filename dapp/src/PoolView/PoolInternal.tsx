import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import useUser from "../account/useUser";
import { ConnectWalletButton } from "../components/ConnectWalletButton";
import ProgressBar from "../components/ProgressBar";
import { RoundedButton } from "../components/RoundedButton";
import { TextFit } from "../components/TextFit";
import { NFTContractContext } from "../nft-contract/NFTContractContext";
import getNftContractAddresses from "../pools/getNftContractAddresses";
import getNftContractName from "../pools/getNftContractName";
import { LevelingPoolContractContext } from "../pools/leveling/LevelingPoolContractContext";
import { PoolBaseInfo } from "../pools/PoolBaseInfo";
import { StakingPopup } from "./StakingPopup";
import countPointsPerDay from "./utils/countPointsPerDay";
import { getTierName } from "./utils/getTierName";

export type PoolInternalProps = {
    poolInfo: PoolBaseInfo;
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

const PoolInternal: React.FC<PoolInternalProps> = ({
    poolInfo
}) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeNftContractAddress, setActiveNftContractAddress] = useState<string>('');
    const nftContractContext = useContext(NFTContractContext);
    const poolContractContext = useContext(LevelingPoolContractContext);
    const user = useUser();
    const navigate = useNavigate();

    const nftContractAddresses = getNftContractAddresses(poolInfo);

    useEffect(() => {
        const init = async () => {
            try {
                await poolContractContext.init(poolInfo);
            } catch (e) {
                console.log('Pool Contract init failed', poolInfo.name, e);
                throw e;
            }

            try {
                await nftContractContext.init({
                    contractAddresses: nftContractAddresses,
                    networkId: poolInfo.networkId,
                    poolContractAddress: poolInfo.poolContractAddress
                });
            } catch (e) {
                console.log('NFT Contract init failed', poolInfo.name, e);
                throw e;
            }
        }

        init();
    }, []);

    if (!nftContractContext?.isInitialized || !poolContractContext?.isInitialized) {
        return <>Loading</>;
    }

    if (!user.account) {
        return (
            <NotConnected>
                <ConnectWalletButton />
            </NotConnected>
        )
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
                        <td>{pointsPerDay}</td>
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
        const { walletPoints, currentLevelPointBoundary, nextLevelPointBoundary } = poolContractContext;
        const value = walletPoints - currentLevelPointBoundary;
        const max = nextLevelPointBoundary - currentLevelPointBoundary;
        return (
            <ProgressBar value={value} min={0} max={max} />
        );
    }

    const createHandleOpenStaking = (nftAddress: string) => {
        return () => {
            setActiveNftContractAddress(nftAddress);
            setIsPopupOpen(true);
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
                    <div className="md:mr-8 my-8 md:my-0">
                        <PoolImage className="mx-auto md:mx-0 " src={poolInfo.coverImage} />
                    </div>

                    <Content>
                        <LevelText>Wallet level <span>{poolContractContext.walletLevel}</span></LevelText>

                        {renderProgressBar()}

                        <div className='mt-6'>
                            <Subtitle>Collection Stats</Subtitle>

                            {nftContractAddresses.map(nftAddress => {
                                const nftAddressName = ((poolInfo.nftContractNames || {})[nftAddress]) || nftAddress;
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

                                        <CollectionButton className='mt-4' onClick={createHandleOpenStaking(nftAddress)}>
                                            Stake / Unstake
                                        </CollectionButton>
                                    </CollectionContainer>
                                )
                            })}
                        </div>
                    </Content>
                </div>
            </Container>

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

export default PoolInternal;
