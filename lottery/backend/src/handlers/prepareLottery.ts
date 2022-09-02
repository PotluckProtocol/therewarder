import { Handler } from "express";
import createNewLottery from "../services/createNewLottery";
import resolveLotteryDetails from "../services/resolveLotteryDetails";

const prepareLotteryHandler: Handler = async (req, res) => {
    const { chainId, contractAddress } = req.params;

    const id = await createNewLottery({
        chainId: Number(chainId),
        contractAddress
    });

    // On background
    resolveLotteryDetails(id);

    res.status(201).send({ id });
}

export default prepareLotteryHandler;