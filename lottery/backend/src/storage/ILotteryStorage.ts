import LotteryItem, { LotteryState } from "./LotteryItem";

export default interface ILotteryStorage {
    create(item: Omit<LotteryItem, "id">): Promise<string>;
    update(id: string, properties: Partial<Omit<LotteryItem, 'id'>>): Promise<boolean>;
    get(id: string): Promise<LotteryItem | null>;
    getAll(onlyState?: LotteryState): Promise<LotteryItem[]>;
}