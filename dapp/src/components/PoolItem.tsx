import { ComponentPropsWithoutRef, ReactNode, useContext, useEffect } from "react";
import styled from "styled-components";
import useUser from "../account/useUser";
import { NFTContractContext, NFTContractProvider } from "../nft-contract/NFTContractContext";
import { RoundedButton } from "./RoundedButton";
import { SimpleItemPair } from "./SimpleItemPair";
import { TextFit } from "./TextFit";
import { NetworkIcon } from "./NetworkIcon";
import classNames from "classnames";
import { LevelingPoolContractContext, LevelingPoolContractProvider } from "../pools/leveling/LevelingPoolContractContext";
import { useNavigate } from "react-router";
import getNftContractAddresses from "../pools/getNftContractAddresses";
import ProgressBar from "./ProgressBar";
import { PoolBaseInfo } from "../pools/PoolBaseInfo";
import useScreenSize from "../hooks/useScreenSize";

export type PoolItemProps = {
    className?: string;
    baseInfo: PoolBaseInfo;
    mode: 'basic' | 'ended';
}

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
    active: boolean;
}

const Container = styled.div<ContainerProps>`
    background-image: url('/images/pool.png');
    background-size: 100%;
    background-repeat: no-repeat;
    width: 600px;
    max-width: 98%;
    margin: 0 auto;

    text-align: center;

    padding-bottom: 135%;

    position: relative;

    ${props => !props.active && `
    filter: blur(6px);
    opacity: .5;

    &:before {
        content: ' ';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 999;
    }
    `}
`;

const Content = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

const PoolNotStartedText = styled.div`
    text-align: center;
    font-size: .8rem;
    color: white;
    line-height: 1.25rem;
    padding: 0 1.75rem;
    max-width: 150px;
    margin: 2rem auto 0;
`;

const PoolName = styled(TextFit)`
    text-align: center;
    font-family: Backbones;
    padding: .5rem 2.25rem;
    color: white;
    text-shadow: -3px 3px #72b6b6;
`;

const CoverImageContainer = styled.div<{ isSmallScreen: boolean }>`
    position: relative;
    max-width: ${props => props.isSmallScreen ? 115 : 130}px;
`;

const CoverImage = styled.img`
    border-radius: 50%;
    box-shadow: #5dffff 1px 1px 18px 1px;
`;

const InfoContainer = styled.div`
    padding: 0 1.75rem;
    color: white;
    font-size: .9rem;
`;

const Button = styled(RoundedButton)`
    position: absolute;
    bottom: 24%;
    right: 50%;
    transform: translateX(50%);
`;

const PositionedNetworkIcon = styled(NetworkIcon)`
    position: absolute;
    top: -0.25rem;
    right: -1rem;
`;

const ProgressBarWrapper = styled.div`
    margin: 0 auto;
    width: 125px;
`;

const PoolItem: React.FC<PoolItemProps> = ({
    className,
    baseInfo,
    mode: rawMode
}) => {
    const user = useUser();
    const screenSize = useScreenSize();
    const nftContractContext = useContext(NFTContractContext);
    const poolContractContext = useContext(LevelingPoolContractContext);
    const navigate = useNavigate();

    const isSmallScreen = screenSize === 'xs';
    const isConnected = !!user.account;

    useEffect(() => {
        const init = async () => {
            try {
                await poolContractContext.init(baseInfo);
            } catch (e) {
                console.log('Pool Contract init failed', baseInfo.name, e);
                throw e;
            }

            try {
                await nftContractContext.init({
                    contractAddresses: getNftContractAddresses(baseInfo),
                    networkId: baseInfo.networkId,
                    poolContractAddress: baseInfo.poolContractAddress
                });
            } catch (e) {
                console.log('NFT Contract init failed', baseInfo.name, e);
                throw e;
            }
        }

        init();
    }, []);

    const isPoolContextInitialized = !!poolContractContext?.isInitialized;

    useEffect(() => {
        if (isPoolContextInitialized && isConnected) {
            poolContractContext.retrieveTokens();
        }
    }, [isPoolContextInitialized, isConnected]);

    // Show this item on list only if 
    // a) Pool is ended and UI shows ended pools
    // b) Pool is not ended and UI shows active pools
    const shouldBeVisibleInThisMode = (
        (poolContractContext.poolState === 'Ended' && rawMode === 'ended') ||
        (poolContractContext.poolState !== 'Ended' && rawMode !== 'ended')
    );

    const isInitialized = poolContractContext.isInitialized && nftContractContext.isInitialized;
    if (!isInitialized || !shouldBeVisibleInThisMode) {
        return null;
    }

    const hasStake = poolContractContext.walletTokens.length > 0;
    const active = rawMode === 'basic' || poolContractContext.walletTokens.length > 0;

    const handleButtonClick = async () => {
        navigate(`/pool?id=${baseInfo.id}`);
    }

    const renderProgressBar = () => {
        const fixPoints = (p: number): number => Math.floor(p / (baseInfo.pointDivider || 1))

        const { walletPoints, currentLevelPointBoundary, nextLevelPointBoundary } = poolContractContext;
        const value = walletPoints - currentLevelPointBoundary;
        const max = nextLevelPointBoundary - currentLevelPointBoundary;
        return (
            <ProgressBarWrapper>
                <ProgressBar labelFontSize={10} value={fixPoints(value)} min={0} max={fixPoints(max)} />
            </ProgressBarWrapper>
        );
    }

    const renderContent = () => {
        if (poolContractContext.poolState === 'NotStarted') {
            return (
                <PoolNotStartedText className="mt-4">
                    We are still filling the pool...
                </PoolNotStartedText>
            )
        } else {
            return (
                <InfoContainer className="mt-2">
                    {hasStake ? (
                        <>
                            <div className='px-2 mt-4 mb-2'>
                                {renderProgressBar()}
                            </div>
                            <SimpleItemPair
                                className="mb-2"
                                label='Wallet level'
                                value={`${poolContractContext.walletLevel}`}
                            />

                            <SimpleItemPair
                                label='Your staked NFTs'
                                value={poolContractContext.walletTokens.length.toString()}
                            />
                        </>
                    ) : (
                        <div className="pt-2">
                            <SimpleItemPair
                                className="mb-1"
                                label='Collections in pool'
                                value={`${getNftContractAddresses(baseInfo).length}`}
                            />
                            <SimpleItemPair
                                className="mb-1"
                                label='Total staked'
                                value={poolContractContext.totalStaked.toString()}
                            />
                        </div>
                    )}
                </InfoContainer>
            );
        }
    }

    let buttonVisible: boolean = true;
    if (!user.account || poolContractContext.poolState === 'NotStarted') {
        buttonVisible = false;
    }

    const buttonClasses = classNames('mt-2', { 'invisible': !buttonVisible });

    return (
        <>
            <Container active={active} className={className}>
                <Content>
                    <PoolName className="flex items-center justify-center my-4" height={55}>{baseInfo.name}</PoolName>
                    <div className='flex justify-center'>
                        <CoverImageContainer isSmallScreen={isSmallScreen}>
                            <PositionedNetworkIcon size={30} networkId={baseInfo.networkId} />
                            <CoverImage src={baseInfo.coverImage} />
                        </CoverImageContainer>
                    </div>

                    {renderContent()}

                    {isInitialized && (
                        <Button className={buttonClasses} onClick={handleButtonClick}>Open</Button>
                    )}
                </Content>
            </Container>
        </>
    );
}

const WrappedPoolItem: React.FC<PoolItemProps> = (props) => {
    return (
        <LevelingPoolContractProvider>
            <NFTContractProvider>
                <PoolItem {...props} />
            </NFTContractProvider>
        </LevelingPoolContractProvider>
    )
}

export default WrappedPoolItem;