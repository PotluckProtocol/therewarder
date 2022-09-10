import { v4 as uuid } from 'uuid';
import { promises as fs, existsSync } from 'fs';
import ILotteryStorage from "./ILotteryStorage";
import LotteryItem, { LotteryState } from "./LotteryItem";
import { join } from 'path';

export default class FileLotteryStorage implements ILotteryStorage {

    constructor(
        private directory: string
    ) { }

    async create(item: Omit<LotteryItem, "id">): Promise<string> {
        const id = uuid();
        const fullItem: LotteryItem = { ...item, id };
        await this.saveToFile(fullItem);

        return id;
    }

    async update(id: string, properties: Partial<Omit<LotteryItem, "id">>): Promise<boolean> {
        const item = await this.loadFromFile(id);
        if (!item) {
            return false;
        }

        const newItem = { ...item, ...properties };
        await this.saveToFile(newItem);

        return true;
    }
    async get(id: string): Promise<LotteryItem | null> {
        return this.loadFromFile(id);
    }

    async getAll(): Promise<LotteryItem[]> {
        const promises = (await fs.readdir(this.directory, { withFileTypes: true }))
            .filter(item => item.isFile())
            .map(item => this.loadFromFile(item.name.split('.')[0]));
        const items = await Promise.all(promises);
        return items.filter(Boolean) as LotteryItem[];
    }

    private async saveToFile(item: LotteryItem) {
        const fileName = join(this.directory, `${item.id}.json`);
        await fs.writeFile(fileName, JSON.stringify(item), { encoding: 'utf8' });
    }

    private async loadFromFile(id: string): Promise<LotteryItem | null> {
        const fileName = join(this.directory, `${id}.json`);
        if (!existsSync(fileName)) {
            return null;
        }

        const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
        try {
            return JSON.parse(fileContent) as LotteryItem;
        } catch (e) {
            return null;
        }
    }

}