import { Handler } from "express";
import getLotteries from "../services/getLotteries";
import requireAccess from "./access/requireAccess";

const getLotteriesHandler: Handler = async (req, res) => {
    const { chainId, contractAddress } = req.params;

    await requireAccess({
        chainId: Number(chainId),
        contractAddress,
        req
    });

    const lotteries = await getLotteries({
        chainId: Number(chainId),
        contractAddress,
    });

    res.status(200).send({ lotteries });
}

export default getLotteriesHandler;