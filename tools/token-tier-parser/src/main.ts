import { promises as fs } from 'fs';

const INPUT_FILE = 'data.json';


(async () => {
    const [tokenIds, tiers] = JSON.parse(await fs.readFile(INPUT_FILE, { encoding: 'utf8' })) as [string[], number[]]
    const TIER_MAP: Record<number, number[]> = {};

    tokenIds.forEach((tokenId, index) => {
        const tier = tiers[index];

        if (!TIER_MAP[tier]) {
            TIER_MAP[tier] = [];
        }

        TIER_MAP[tier].push(Number(tokenId));
    });

    Object.keys(TIER_MAP).forEach(key => {

        const tier = Number(key);
        const tokenIds = TIER_MAP[tier] || [];

        console.log('Tier', tier);
        console.log('Tokens: ', JSON.stringify(tokenIds));
        console.log('Tiers:', JSON.stringify(Array(tokenIds.length).fill(tier)))
        console.log('-----');
    });

})();