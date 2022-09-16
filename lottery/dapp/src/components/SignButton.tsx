import { useContext } from "react";
import styled from "styled-components";
import { AccountContext } from "../account/AccountContext";

const Button = styled.button`
    box-shadow: #43b8b8 0px 0px 10px 2px;
    background-color: #000;
    color: #fff;
    padding: .3rem .7rem;
    font-size: 1rem;
    line-height: 25px;
`;

export const SignButton: React.FC = () => {
    const accountContext = useContext(AccountContext);

    const handleButtonClick = () => {
        if (accountContext.account) {
            accountContext.sign();
        }
    }

    let buttonText = 'Authenticate';
    let buttonDisabled = false;
    if (accountContext.isSigning) {
        buttonText = 'Authenticating...';
    } else if (!!accountContext.account?.hasSigned) {
        buttonText = 'Authenticated';
        buttonDisabled = true;
    }

    return (
        <Button disabled={buttonDisabled} onClick={handleButtonClick} className="flex justify-between items-center">
            <div>{buttonText}</div>
        </Button>
    )
}