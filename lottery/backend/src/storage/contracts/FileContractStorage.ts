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
    async get(chainId: number, contractAddress: string): Promise<ContractItem | null> {
        return this.loadFromFile(chainId, contractAddress);
    }

    private async saveToFile(item: ContractItem) {
        const fileName = join(this.directory, this.createFileName(item.chainId, item.address));
        await fs.writeFile(fileName, JSON.stringify(item), { encoding: 'utf8' });
    }

    private async loadFromFile(chainId: number, addr: string): Promise<ContractItem | null> {
        const fileName = join(this.directory, this.createFileName(chainId, addr));
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

    private createFileName(chainId: number, contractAddress: string): string {
        return `${chainId}__${contractAddress}.json`;
    }

}