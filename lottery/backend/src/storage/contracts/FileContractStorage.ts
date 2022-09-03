import { v4 as uuid } from 'uuid';
import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import IContractStorage from './IContractStorage';
import ContractItem from './ContractItem';

export default class FileContractStorage implements IContractStorage {

    constructor(
        private directory: string
    ) { }

    async create(item: ContractItem): Promise<void> {
        await this.saveToFile(item);
    }
    async get(id: string): Promise<ContractItem | null> {
        return this.loadFromFile(id);
    }

    private async saveToFile(item: ContractItem) {
        const fileName = join(this.directory, `${item.address}.json`);
        await fs.writeFile(fileName, JSON.stringify(item), { encoding: 'utf8' });
    }

    private async loadFromFile(addr: string): Promise<ContractItem | null> {
        const fileName = join(this.directory, `${addr}.json`);
        if (!existsSync(fileName)) {
            return null;
        }

        const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
        try {
            const contractItem = JSON.parse(fileContent) as ContractItem;
            if (typeof contractItem.owners === 'string') {
                contractItem.owners = [contractItem.owners];
            }
            return contractItem;
        } catch (e) {
            return null;
        }
    }

}