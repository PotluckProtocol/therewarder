import express, { Handler } from 'express';
import getLotteriesHandler from './handlers/getLotteries';
import prepareLotteryHandler from './handlers/prepareLottery';
import wrapHandler from './utils/wrapHandler';
import extractSignatureMiddleware from './middlewares/extractSignature';
import getContractStorage from './storage/contracts/getContractStorage';

const expressApp = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

(async () => {
    const contractStorage = getContractStorage();

    contractStorage.create({
        chainId: 250,
        address: '0x81638132e4FC522126b6F1697C408e7630F8f291',
        owners: ['0x5e04fb43524f5271F9a377fb35448Aa0F8EcaAD5']
    });

    const registerHandler = (
        method: 'get' | 'post',
        path: string,
        handler: Handler,
        authRequired: boolean = true
    ): void => {
        const middleware = authRequired ? [wrapHandler(extractSignatureMiddleware)] : [];
        expressApp[method](path, [], wrapHandler(handler));
    }

    registerHandler('get', '/:chainId/:contractAddress', getLotteriesHandler);
    registerHandler('post', '/:chainId/:contractAddress/prepare', prepareLotteryHandler);

    expressApp.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });

})();
