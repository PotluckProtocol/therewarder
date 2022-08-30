import styled from "styled-components";

export type RoundedButtonProps = React.ComponentPropsWithRef<'button'>;

export const RoundedButton = styled.button`
    background-color: #5dffff;
    color: black;
    font-family: Akira;
    border-radius: 2rem;
    font-size: 1rem;
    padding: .25rem 1rem;
    box-shadow: rgba(93, 255, 255, .5) 1px 1px 10px 1px;

    transition: background-color 250ms ease-in-out;

    &:hover {
        background-color: #5ba7a7;
    }

    &:disabled {
        background: gray;
        cursor: not-allowed;
    }
`;