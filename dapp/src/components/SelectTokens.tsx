import Select from 'react-select';

export type SelectTokensProps = {
    tokens: Array<{ value: string, label: string }>;
    onChange: (tokenIds: number[]) => void;
    selectedTokens: number[];
    maxSelected?: number;
}

const ALL_VALUE = '__all';

type Option = { label: string, value: string };

export const SelectTokens: React.FC<SelectTokensProps> = ({
    tokens,
    onChange,
    selectedTokens,
    maxSelected
}) => {

    let selectManyLabel = 'Select all';
    if (typeof maxSelected === 'number' && tokens.length > maxSelected) {
        selectManyLabel = `Select next ${maxSelected}`;
    }

    const tokenIdOptions = [
        { label: selectManyLabel, value: ALL_VALUE },
        ...tokens
    ];

    const handleSelectInputChange = (values: Option[]) => {

        const hasAllSelectedItem = !!values.find(item => item.value === ALL_VALUE);

        let selectedTokenOptions = values;
        if (hasAllSelectedItem) {
            selectedTokenOptions = [...tokenIdOptions].filter(item => item.value !== ALL_VALUE)
            if (maxSelected) {
                selectedTokenOptions = selectedTokenOptions.splice(0, maxSelected);
            }
        }

        onChange(selectedTokenOptions.map(item => Number(item.value)));
    }

    const selectedTokenIds = tokenIdOptions.filter(item => selectedTokens.includes(Number(item.value)));
    const isOptionDisabled = typeof maxSelected === 'number' && selectedTokenIds.length >= maxSelected;

    return (
        <Select
            isMulti={true}
            options={tokenIdOptions as any}
            onChange={handleSelectInputChange as any}
            value={selectedTokenIds}
            isSearchable={false}
            placeholder='Select tokens...'
            isOptionDisabled={() => isOptionDisabled}
            styles={{
                control: (base: any) => ({
                    ...base,
                    outlineColor: '#5dffff',
                    borderColor: '#5dffff',
                    backgroundColor: '#5dffff',
                    ':hover': {
                        borderColor: '#5dffff',
                        cursor: 'pointer'
                    }
                }),
                indicatorSeparator: (base: any) => ({
                    ...base,
                    backgroundColor: '#000 !important'
                }),
                clearIndicator: (base: any) => ({
                    ...base,
                    color: '#000 !important',
                }),
                dropdownIndicator: (base: any) => ({
                    ...base,
                    color: '#000 !important',
                }),
                placeholder: (base: any) => ({
                    ...base,
                    color: '#000 !important'
                })
            }}
        />
    )
}