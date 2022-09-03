import { Handler } from "express";
import checkOwner from "../services/checkOwner";
import createNewLottery from "../services/createNewLottery";
import resolveLotteryDetails from "../services/resolveLotteryDetails";
import getSignatureFromRequest from "../utils/getSignatureFromRequest";

const prepareLotteryHandler: Handler = async (req, res) => {
    const { chainId, contractAddress } = req.params;
    const { fromBlock } = (req.query || {});

    const signature = getSignatureFromRequest(req);
    if (!signature) {
        return res.status(401).send();
    }

    const isOwner = checkOwner(contractAddress, signature);
    if (!isOwner) {
        return res.status(403).send();
    }

    const id = await createNewLottery({
        chainId: Number(chainId),
        contractAddress,
        startFromBlock: typeof fromBlock === 'string' ? Number(fromBlock) : undefined
    });

    // On background
    resolveLotteryDetails(id);

    res.status(201).send({ id });
}

export default prepareLotteryHandler;