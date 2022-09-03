import { existsSync, mkdirSync } from "fs";
import FileContractStorage from "./FileContractStorage";
import IContractStorage from "./IContractStorage";

const DATA_DIR = 'data';

let storage: IContractStorage;

const getContractStorage = (): IContractStorage => {
    if (!storage) {
        if (!existsSync(DATA_DIR)) {
            mkdirSync(DATA_DIR);
        }
        storage = new FileContractStorage(DATA_DIR);
    }

    return storage;
}

export default getContractStorage;