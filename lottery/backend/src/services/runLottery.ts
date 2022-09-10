import getLotteryStorage from "../storage/lottery/getLotteryStorage"
import LotteryItem from "../storage/lottery/LotteryItem";
import addLotteryWinner from "./addLotteryWinner";

export class LotteryNotFoundError extends Error { }
export class LotteryNotReadyForLottery extends Error { }

export type LotteryStrategy = 'WinMany' | 'WinOne';

export type RunLotteryOpt = {
    winnerCount: number;
    onLotteryDraw?: (winner: string, drawIndex: number) => void;
    strategy: LotteryStrategy;
    drawIntervalMs?: number;
}

const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isValidWinner = (
    lottery: LotteryItem,
    strategy: LotteryStrategy,
    winnerWallet: string
): boolean => {
    if (strategy === 'WinMany') {
        return true;
    } else if (strategy === "WinOne") {
        const hasWonAlready = (lottery.lottery?.results || []).includes(winnerWallet);
        return !hasWonAlready;
    } else {
        throw new Error(`Unknown lottery strategy "${strategy}"`)
    }
}

const runLottery = async (lotteryId: string, opts: RunLotteryOpt): Promise<string | null> => {

    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(lotteryId);
    if (!lottery) {
        throw new LotteryNotFoundError();
    } else if (lottery.currentState !== 'READY_FOR_LOTTERY') {
        throw new LotteryNotReadyForLottery();
    }

    const {
        strategy
    } = opts;

    const tickets = lottery.lottery?.tickets || {}
    const ticketArray: string[] = Object.keys(tickets).flatMap(wallet => {
        const level = tickets[wallet];
        return Array(level).fill(wallet);
    });

    const randomWinningIndex = Math.floor(Math.random() * ticketArray.length);
    const [winnerWallet] = ticketArray.splice(randomWinningIndex, 1);

    if (!isValidWinner(lottery, strategy, winnerWallet)) {
        return null;
    }

    await addLotteryWinner(lottery.id, winnerWallet);

    return winnerWallet;
}

export default runLottery;