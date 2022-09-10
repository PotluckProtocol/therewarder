import { Handler } from "express";
import createNewLottery from "../services/createNewLottery";
import resolveLotteryDetails from "../services/resolveLotteryDetails";
import requireAccess from "./access/requireAccess";

const prepareLotteryHandler: Handler = async (req, res) => {
    const { chainId, contractAddress } = req.params;

    await requireAccess({ chainId: Number(chainId), contractAddress, req });

    const { fromBlock } = (req.query || {});

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