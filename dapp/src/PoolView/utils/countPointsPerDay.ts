import { PointCalculationDetails } from "../../pools/leveling/LevelingPoolContractWrapper";

const SECONDS_IN_DAY = 60 * 60 * 24;

const countPointsPerDay = (
    tokenTiers: number[],
    pointCalculationDetails: PointCalculationDetails
) => {
    let sum: number = 0;

    for (const tokenTier of tokenTiers) {
        const pointsPerSecond = pointCalculationDetails.pointsBasePerSecond * pointCalculationDetails.tierMultipliers[tokenTier] * pointCalculationDetails.weight;
        const dayPoints = SECONDS_IN_DAY * pointsPerSecond;
        const adjusted = Math.floor(dayPoints / 100);
        sum += adjusted;
    }

    return sum;
}

export default countPointsPerDay;