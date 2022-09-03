
const INITIAL_BLOCKS: Record<number, number> = {
    250: 46140290,
    43114: 19452728
}

const getInitialBlockForChain = (chainId: number) => {
    return INITIAL_BLOCKS[chainId] || 0;
}

export default getInitialBlockForChain;