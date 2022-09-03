import LotteryItem, { LotteryState } from "./LotteryItem";

export type UpdateProperties = Partial<Omit<LotteryItem, 'id'>>;

export default interface ILotteryStorage {
    create(item: Omit<LotteryItem, "id">): Promise<string>;
    update(id: string, properties: UpdateProperties): Promise<boolean>;
    get(id: string): Promise<LotteryItem | null>;
    getAll(onlyState?: LotteryState): Promise<LotteryItem[]>;
}