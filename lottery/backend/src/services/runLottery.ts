import getLotteryStorage from "../storage/lottery/getLotteryStorage"

export class LotteryNotFoundError extends Error { }
export class LotteryNotReadyForLottery extends Error { }

export type RunLotteryOpt = {
    winnerCount: number;
    onLotteryDraw?: (winner: string, drawIndex: number) => void;
    uniqueWinners?: boolean;
    drawIntervalMs?: number;
}

const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runLottery = async (lotteryId: string, opts: RunLotteryOpt) => {

    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(lotteryId);
    if (!lottery) {
        throw new LotteryNotFoundError();
    } else if (lottery.currentState !== 'READY_FOR_LOTTERY') {
        throw new LotteryNotReadyForLottery();
    }

    const {
        winnerCount,
        drawIntervalMs,
        uniqueWinners,
        onLotteryDraw
    } = opts;

    const tickets = lottery.lottery?.tickets || {}
    const ticketArray: string[] = Object.keys(tickets).flatMap(wallet => {
        const level = tickets[wallet];
        return Array(level).fill(wallet);
    });

    const winnerArray: string[] = [];
    while (winnerArray.length < winnerCount) {
        const randomWinningIndex = Math.floor(Math.random() * ticketArray.length);
        const [winnerWallet] = ticketArray.splice(randomWinningIndex, 1);
        if (uniqueWinners && winnerArray.includes(winnerWallet)) {
            continue;
        }

        if (typeof onLotteryDraw === 'function') {
            onLotteryDraw(winnerWallet, winnerArray.length);
        }

        winnerArray.push(winnerWallet);
        await wait(drawIntervalMs || 0);
    }

    return winnerArray;
}

export default runLottery;