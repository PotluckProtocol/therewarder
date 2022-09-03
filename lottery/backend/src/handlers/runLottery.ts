import { Handler } from "express";
import checkOwner from "../services/checkOwner";
import createNewLottery from "../services/createNewLottery";
import resolveLotteryDetails from "../services/resolveLotteryDetails";
import runLottery from "../services/runLottery";
import getLotteryStorage from "../storage/lottery/getLotteryStorage";
import getSignatureFromRequest from "../utils/getSignatureFromRequest";

const runLotteryHandler: Handler = async (req, res) => {
    const { lotteryId } = req.params;

    const signature = getSignatureFromRequest(req);
    if (!signature) {
        return res.status(401).send();
    }

    const lotteryStorage = getLotteryStorage();
    const lottery = await lotteryStorage.get(lotteryId);
    if (!lottery) {
        return res.send(404).send();
    }

    const isOwner = checkOwner(lottery.contractAddress, signature);
    if (!isOwner) {
        return res.status(403).send();
    }

    const winners = await runLottery(lotteryId, {
        winnerCount: 5,
        drawIntervalMs: 5000,
        uniqueWinners: true
    });

    res.status(200).send({ winners });
}

export default runLotteryHandler;