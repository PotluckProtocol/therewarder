import { ComponentPropsWithRef } from "react";
import styled from "styled-components";

export type ProgressBarProps = {
    min: number;
    max: number;
    value: number;
    className?: string;
    labelFontSize?: number;
}

type BarProps = ComponentPropsWithRef<'div'> & {
    percentageWidth: string
}

const RootContainer = styled.div`

`;

const BarContainer = styled.div`
    height: 25px;
    background-color: #000;
    border-radius: 2rem;
    position: relative;
    box-shadow: #670512 1px 1px 18px 1px;
`;

const Bar = styled.div<BarProps>`
    background-color: #670512;
    border-radius: 2rem;
    height: 100%;
    width: ${props => props.percentageWidth};
    height: 25px;
    transition: width .75s ease-in-out;
`;

const Label = styled.div<{ fontSize?: number }>`
    font-family: Akira;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    line-height: 25px;
    color: white;
    font-size: ${props => props.fontSize || 18}px;
`;

const ProgressBar: React.FC<ProgressBarProps> = ({
    min,
    max,
    value,
    className,
    labelFontSize
}) => {
    const countedValue = value - min;
    const countedMax = max - min;
    const percentage = ((value === 0) ? value : (countedValue / countedMax * 100)).toFixed(2) + '%';
    return (
        <RootContainer className={className}>
            <BarContainer className="flex rounded-sm" role="progressbar">
                <Bar className="rounded-sm" percentageWidth={percentage} />
                <Label fontSize={labelFontSize}>
                    {countedValue} / {countedMax}
                </Label>
            </BarContainer>

        </RootContainer>
    )
}

export default ProgressBar