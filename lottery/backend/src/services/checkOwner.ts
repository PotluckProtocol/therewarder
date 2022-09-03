import { ethers } from 'ethers';
import STATIC_MESSAGE from '../STATIC_MESSAGE';
import getContractStorage from '../storage/contracts/getContractStorage';

const checkOwner = async (contractAddress: string, signature: string): Promise<boolean> => {
    const contractStorage = getContractStorage();
    const contractItem = await contractStorage.get(contractAddress);
    if (!contractItem) {
        return false;
    }
    const address = ethers.utils.verifyMessage(STATIC_MESSAGE, signature);
    return contractItem.owners.includes(address);
}

export default checkOwner