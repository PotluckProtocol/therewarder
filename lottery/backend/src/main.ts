import { getContractAddress } from 'ethers/lib/utils';
import express, { Handler } from 'express';
import prepareLotteryHandler from './handlers/prepareLottery';
import RequestWithUser from './handlers/RequestWithUser';
import getContractStorage from './storage/contracts/getContractStorage';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;



const extractSignatureMiddleware: Handler = (req, res, next) => {
    const signature = req.header('auth');
    if (!signature) {
        res.status(400).send('Bad request');
        return;
    } else {
        (req as RequestWithUser).user = {
            signature
        }
        next();
    }
}

(async () => {
    const contractStorage = getContractStorage();

    contractStorage.create({
        address: '0x81638132e4FC522126b6F1697C408e7630F8f291',
        owners: ['0x5e04fb43524f5271F9a377fb35448Aa0F8EcaAD5']
    });

})();

app.post('/prepare/:chainId/:contractAddress', [extractSignatureMiddleware], prepareLotteryHandler);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})