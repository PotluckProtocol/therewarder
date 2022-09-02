import FileLotteryStorage from "./FileLotteryStorage";
import ILotteryStorage from "./ILotteryStorage";

let storage: ILotteryStorage;

const getLotteryStorage = (): ILotteryStorage => {
    if (!storage) {
        storage = new FileLotteryStorage('data');
    }

    return storage;
}

export default getLotteryStorage;