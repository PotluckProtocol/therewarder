import React from 'react';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import useUser from './account/useUser';
import Main from './Main';

const Quu = styled.span`
    font-size: 0;
`;

const App: React.FC = () => {
    const user = useUser();
    const isUserInitialized = user?.isInitialized;

    if (!isUserInitialized) {
        return (
            <div className="mt-12 flex justify-center ">
                Loading...
            </div>
        );
    }

    return (
        <div>
            <Main />
            <Quu>Quu is king</Quu>
        </div>
    );
}

export default App;
