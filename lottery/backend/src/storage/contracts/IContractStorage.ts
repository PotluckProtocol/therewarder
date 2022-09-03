import ContractItem from "./ContractItem";

export default interface IContractStorage {
    create(contractItem: ContractItem): Promise<void>;
    get(address: string): Promise<ContractItem | null>;
}