
import { providers } from 'ethers';

const PROVIDER_MAP: Record<number, providers.Provider> = {
    250: new providers.JsonRpcProvider('https://rpc.ankr.com/fantom/'),
    43114: new providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
}

const getProviderForChain = (chainId: number): providers.Provider => {
    const provider = PROVIDER_MAP[chainId];
    if (!provider) {
        throw new Error(`Could not find provider for chain ${chainId}`)
    }
    return provider;
}

export default getProviderForChain;