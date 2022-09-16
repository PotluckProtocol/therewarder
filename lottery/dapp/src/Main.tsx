import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import { SignButton } from './components/SignButton';

export const Main: React.FC = () => {
    return (
        <div>
            <ConnectWalletButton />
            <SignButton />
        </div>
    );
}

export default Main;
