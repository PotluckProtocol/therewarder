import { MouseEventHandler, ReactNode, useContext, useEffect, useRef, useState } from "react"
import styled, { CSSProperties } from "styled-components";
import { PoolBaseInfo } from "../pools/PoolBaseInfo";
import { ButtonGroup, GroupButton } from "../components/ButtonGroup";
import { RoundedButton } from "../components/RoundedButton";
import { SelectTokens } from "../components/SelectTokens";
import { TextFit } from "../components/TextFit";
import { FiXCircle } from 'react-icons/fi';
import { NFTContractContext } from "../nft-contract/NFTContractContext";
import { Loading } from "../components/Loading";
import { toast } from "react-toastify";
import { LevelingPoolContractContext, Token } from "../pools/leveling/LevelingPoolContractContext";
import { getTierName } from "./utils/getTierName";

export type StakingPopupProps = {
    poolBaseInfo: PoolBaseInfo;
    nftContractAddress: string;
    isFinishedPool?: boolean;
    onClose: () => void;
}

const Backdrop = styled.div`
    max-height: 100%;
    overflow-y: auto;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 8998;
    background-color: rgba(0,0,0,0.90);
`;

const Container = styled.div`
    position: relative;
    text-align: center;
    max-width: 428px;
    width: 95%;
    border: 3px solid #5dffff;
    background-color: #000;
    border-radius: 2rem;
    box-shadow: #5dffff 1px 1px 18px 1px;
`;

const PoolName = styled(TextFit)`
    font-family: Backbones;
    padding: 0 2rem;
    color: white;
`;

const Paragraph = styled.p`
    text-align: center;
    color: white;
    font-size: .8rem;
`;

const StakingContainer = styled.div`
    padding: 1rem 2rem;
`;

const UnstakingContainer = styled.div`
    padding: 1rem 2rem;
`;

const ActionButton = styled(RoundedButton)`
`;

const CloseButton = styled.button`
    border: none;
    background: none;
    position: absolute;
    width: 30px;
    height: 30px;
    top: .5rem;
    right: .5rem;
    color: white;
`;

const LoadingText = styled.div`
    color: #fff;
    font-size: 1.1rem;
`;

const buttonStyle: CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.45)'
}

const RewardsEndedInfo = styled.p`
    color: white;
    font-size: .9rem;
`;

export const StakingPopup: React.FC<StakingPopupProps> = ({
    poolBaseInfo,
    nftContractAddress,
    onClose,
    isFinishedPool
}) => {
    const backdropRef = useRef(null);
    const nftContractContext = useContext(NFTContractContext);
    const poolContractContext = useContext(LevelingPoolContractContext);

    const [isLoadingWalletTokens, setIsLoadingWalletTokens] = useState(false);

    const [tokensInUserWallet, setTokensInUserWallet] = useState<Token[]>([]);
    const [selectedView, setSelectedView] = useState<string>(isFinishedPool ? 'unstake' : 'stake');
    const [selectedTokens, setSelectedTokens] = useState<number[]>([]);

    const updateTokensInUserWallet = async (tokenIds: number[]) => {
        const tokens = await poolContractContext.createTokens(nftContractAddress, tokenIds);
        setTokensInUserWallet(tokens);
    }

    useEffect(() => {
        if (poolContractContext.isInitialized && nftContractContext.isInitialized) {
            const load = async () => {
                await poolContractContext.retrieveTokens();

                setIsLoadingWalletTokens(true);
                try {
                    await nftContractContext.refreshTokenIds(nftContractAddress);
                } finally {
                    setIsLoadingWalletTokens(false);
                }

            }
            load();
        }

    }, [nftContractAddress, poolContractContext.isInitialized, nftContractContext.isInitialized]);

    useEffect(() => {
        updateTokensInUserWallet(nftContractContext.walletTokenIds[nftContractAddress] || []);
    }, [nftContractContext.walletTokenIds]);

    const buttonGroupButtons: GroupButton[] = [{
        text: 'Stake',
        value: 'stake',
        active: selectedView === 'stake'
    }, {
        text: 'Unstake',
        value: 'unstake',
        active: selectedView === 'unstake'
    }];

    const handleBackdropClick: MouseEventHandler<HTMLDivElement> = (event) => {
        if (event.target === backdropRef.current) {
            onClose();
        }
    }

    const handleSelectView = (btn: GroupButton) => {
        setSelectedTokens([]);
        setSelectedView(btn.value);
    }

    const collectionWalletTokens = poolContractContext.walletTokens.filter(item => item.nftContract === nftContractAddress);

    let viewContent: ReactNode;
    if (selectedView === 'stake') {
        const handleStakeButtonClick = async () => {
            if (nftContractContext.walletIsApproved[nftContractAddress]) {
                try {
                    await poolContractContext.stakeNfts(nftContractAddress, selectedTokens);
                    nftContractContext.removeTokenIdsFromSession(nftContractAddress, selectedTokens);
                    toast(`Successfully staked ${selectedTokens.length} tokens.`, { type: 'success', theme: 'colored' });
                } catch (e) {
                    console.log('Error on staking', e);
                    toast('Staking failed', { type: 'error', theme: 'colored' });
                }
                setSelectedTokens([]);
            } else {
                await nftContractContext.approve(nftContractAddress);
            }
        }

        let buttonDisabled: boolean = selectedTokens.length === 0;
        let buttonText: string = 'Stake';
        if (nftContractContext.isApproving) {
            buttonText = 'Approving...';
            buttonDisabled = true;
        } else if (!nftContractContext.walletIsApproved[nftContractAddress]) {
            buttonText = 'Approve';
        } else if (poolContractContext.isStaking) {
            buttonText = 'Staking...';
            buttonDisabled = true;
        }

        const tokens = (nftContractContext.walletTokenIds[nftContractAddress] || []).map((id) => {
            let label = `Token #${id}`;
            const token = tokensInUserWallet.find(item => item.tokenId === id);
            if (token) {
                label += ` (${getTierName(poolBaseInfo, nftContractAddress, token.tierIndex)})`;
            }

            return {
                label,
                value: id.toString()
            }
        });

        viewContent = (
            <StakingContainer className='mt-4'>
                {isLoadingWalletTokens ? (
                    <>
                        <LoadingText>Loading tokens from your wallet...</LoadingText>
                        <Loading width={85} />
                    </>
                ) : (
                    <>
                        <Paragraph className='mb-2'>You have <b>{nftContractContext.walletBalance[nftContractAddress]}</b> tokens to be staked. Which ones to stake?</Paragraph>

                        <SelectTokens
                            tokens={tokens}
                            selectedTokens={selectedTokens}
                            onChange={tokens => setSelectedTokens(tokens)}
                            maxSelected={10}
                        />

                        <Paragraph className='mt-2 mb-4'>You have selected <b>{selectedTokens.length}</b> tokens...</Paragraph>

                        <ActionButton disabled={buttonDisabled} onClick={handleStakeButtonClick}>
                            {buttonText}
                        </ActionButton>
                    </>
                )}
            </StakingContainer>
        )
    } else {
        const buttonDisabled = selectedTokens.length === 0 || poolContractContext.isUnstaking;
        let buttonText = 'Unstake';
        if (poolContractContext.isUnstaking) {
            buttonText = 'Unstaking...';
        }

        const handleUnstakeButtonClick = async () => {
            try {
                await poolContractContext.unstakeNfts(nftContractAddress, selectedTokens);
                nftContractContext.addTokenIdsOnSession(nftContractAddress, selectedTokens);
                toast(`Successfully unstaked ${selectedTokens.length} tokens.`, { type: 'success', theme: 'colored' });
            } catch (e) {
                console.log('Error on unstaking', e);
                toast('Unstaking failed', { type: 'error', theme: 'colored' });
            }

            setSelectedTokens([]);
        }

        const tokens = collectionWalletTokens.map((token) => ({
            label: `Token #${token.tokenId}`,
            value: token.tokenId.toString()
        }));

        viewContent = (
            <UnstakingContainer className='mt-4'>
                <Paragraph className='mb-2'>You have staked <b>{collectionWalletTokens.length}</b> tokens, select tokens to be unstaked...</Paragraph>

                <SelectTokens
                    tokens={tokens}
                    selectedTokens={selectedTokens}
                    onChange={tokens => setSelectedTokens(tokens)}
                    maxSelected={10}
                />

                <Paragraph className='mt-2 mb-4'>You have selected <b>{selectedTokens.length}</b> tokens...</Paragraph>

                <ActionButton disabled={buttonDisabled} onClick={handleUnstakeButtonClick}>
                    {buttonText}
                </ActionButton>
            </UnstakingContainer>
        );
    }

    const content: ReactNode = (
        <Backdrop ref={backdropRef} onClick={handleBackdropClick}>
            <Container className="mt-4 sm:mt-12 lg:mt-24 mx-auto p-4">
                <CloseButton onClick={onClose}>
                    <FiXCircle size={30} />
                </CloseButton>
                <PoolName className="flex items-center justify-center mb-4" height={45}>{poolBaseInfo.name}</PoolName>
                {isFinishedPool ? (
                    <RewardsEndedInfo>Pool rewards has been ended. Unharvested rewards are paid on unstake.</RewardsEndedInfo>
                ) : (
                    <>
                        <Paragraph className="mb-2">Your intent?</Paragraph>

                        <ButtonGroup
                            buttons={buttonGroupButtons}
                            buttonStyle={buttonStyle}
                            onSelect={handleSelectView}
                        />
                    </>
                )}

                {viewContent}
            </Container>
        </Backdrop>
    );

    return content;
}