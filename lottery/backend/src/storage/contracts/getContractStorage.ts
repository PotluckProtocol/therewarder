import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import FileContractStorage from "./FileContractStorage";
import IContractStorage from "./IContractStorage";

const DATA_DIR = join('data', 'contracts');

let storage: IContractStorage;

const getContractStorage = (): IContractStorage => {
    if (!storage) {
        if (!existsSync(DATA_DIR)) {
            mkdirSync(DATA_DIR, { recursive: true });
        }
        storage = new FileContractStorage(DATA_DIR);
    }

    return storage;
}

export default getContractStorage;