import { Handler } from "express";
import runLottery from "../services/runLottery";
import getLotteryStorage from "../storage/lottery/getLotteryStorage";
import requireAccess from "./access/requireAccess";
import HttpErrorNotFound from "../utils/httpErrors/404NotFound";

const runLotteryHandler: Handler = async (req, res) => {
    const { lotteryId } = req.params;

    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(lotteryId);
    if (!lottery) {
        throw new HttpErrorNotFound();
    }

    await requireAccess({
        chainId: lottery.chainId,
        contractAddress: lottery.contractAddress,
        req
    });

    const winner = await runLottery(lotteryId, {
        winnerCount: 5,
        drawIntervalMs: 5000,
        strategy: 'WinOne'
    });

    res.status(200).send({ winner });
}

export default runLotteryHandler;