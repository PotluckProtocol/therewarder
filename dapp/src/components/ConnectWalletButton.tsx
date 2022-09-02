import { useContext } from "react";
import styled from "styled-components";
import { AccountContext } from "../account/AccountContext";
import { NetworkIcon } from "./NetworkIcon";
import { RoundedButton } from "./RoundedButton";

const toShortWallet = (walletAddr: string): string => {
    return [
        walletAddr.substring(0, 4),
        walletAddr.substring(walletAddr.length - 4)
    ].join('...');
}

const ConnectButton = styled(RoundedButton)`
    box-shadow: #43b8b8 0px 0px 10px 2px;
    background-color: #000;
    color: #fff;
    padding: .3rem .7rem;
    font-size: 1rem;
    line-height: 25px;
`;

export const ConnectWalletButton: React.FC = () => {
    const accountContext = useContext(AccountContext);

    const handleButtonClick = () => {
        if (accountContext.account) {
            accountContext.disconnect();
        } else {
            accountContext.connect();
        }
    }

    let connectButtonText = 'Connect Wallet';
    if (accountContext.isConnecting) {
        connectButtonText = 'Connecting...';
    } else if (!!accountContext.account) {
        connectButtonText = toShortWallet(accountContext.account.walletAddress);
    }

    return (
        <ConnectButton onClick={handleButtonClick} className="flex justify-between items-center">
            <div>{connectButtonText}</div>
            {(!!accountContext.account) && (
                <NetworkIcon className="ml-2" networkId={accountContext.account.network.networkId} size={25} />
            )}
        </ConnectButton>
    )
}