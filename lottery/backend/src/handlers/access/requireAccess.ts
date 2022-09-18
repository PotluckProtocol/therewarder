import { ethers } from 'ethers';
import { Request } from 'express';
import getContractStorage from '../../storage/contracts/getContractStorage';
import HttpErrorUnauthorized from '../../utils/httpErrors/401Unauthorized';
import HttpErrorForbidden from '../../utils/httpErrors/403Forbidden';
import getSignatureAndMessageFromRequest from './getSignatureAndMessageFromRequest';

export type RequireAccessOpts = {
    req: Request;
    chainId: number;
    contractAddress: string;
}

const requireAccess = async (opts: RequireAccessOpts): Promise<void> => {
    return;
    /*const { chainId, contractAddress, req } = opts;

    const { signature, signatureMessage } = getSignatureAndMessageFromRequest(req) || {}
    if (!signature || !signatureMessage) {
        throw new HttpErrorUnauthorized();
    }

    const contractStorage = getContractStorage();
    const contractItem = await contractStorage.get(chainId, contractAddress);
    if (!contractItem) {
        throw new HttpErrorForbidden();
    }

    const address = ethers.utils.verifyMessage(signatureMessage, signature);
    const isOwner = contractItem.owners.includes(address);
    if (!isOwner) {
        throw new HttpErrorForbidden();
    }*/
}

export default requireAccess