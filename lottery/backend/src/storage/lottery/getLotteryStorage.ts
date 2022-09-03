import { existsSync, mkdirSync } from "fs";
import FileLotteryStorage from "./FileLotteryStorage";
import ILotteryStorage from "./ILotteryStorage";

const DATA_DIR = 'data';

let storage: ILotteryStorage;

const getLotteryStorage = (): ILotteryStorage => {
    if (!storage) {
        if (!existsSync(DATA_DIR)) {
            mkdirSync(DATA_DIR);
        }
        storage = new FileLotteryStorage(DATA_DIR);
    }

    return storage;
}

export default getLotteryStorage;