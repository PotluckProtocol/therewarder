import { ethers } from 'ethers';
import { Network } from "../network/Networks";

export type Account = {
    walletAddress: string;
    signature: null | string;
    hasSigned: boolean;
    network: Network;
    web3: ethers.providers.Provider;
    signer: ethers.Signer;
}