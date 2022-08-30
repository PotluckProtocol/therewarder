import React, { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import { Navbar } from './components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import useUser from './account/useUser';
import { Loading } from './components/Loading'
import { Route, Routes } from 'react-router';
import Main from './Main';
import PoolView from './PoolView/PoolView';
import { PoolsBaseInfoContext } from './pools/PoolsBaseInfoContext';
import useScreenSize from './hooks/useScreenSize';

const Container = styled.div`
    max-width: 1400px;
`;

const Header = styled.h1<{ isSmallScreen: boolean }>`
    text-align: center;
    font-size: ${props => props.isSmallScreen ? 5 : 6}rem;
    line-height: ${props => props.isSmallScreen ? 5 : 6}rem;
    font-family: Backbones;
    color: white;
    margin-top: 6rem;
    text-shadow: -0.5rem 0.5rem #000
`;

const Description = styled.p<{ isSmallScreen: boolean }>`
    font-family: Akira;
    color: white;
    text-align: center;
    font-size: ${props => props.isSmallScreen ? 1 : 2}rem;
    line-height: ${props => props.isSmallScreen ? 1 : 2}rem;
    text-shadow: -0.25rem 0.25rem #000
`;

const Disclaimer = styled.div`
    font-size: .6rem;
    color: white;
    text-align: center;  
`;

const Quu = styled.span`
    font-size: 0;
`;

const App: React.FC = () => {
    const user = useUser();
    const poolBaseInfoContext = useContext(PoolsBaseInfoContext);
    const screenSize = useScreenSize();
    const isSmallScreen = screenSize === 'xs';

    if (poolBaseInfoContext.isLoading || !user?.isInitialized) {
        return (
            <div className="mt-12 flex justify-center ">
                <Loading size={15} width={150} />
            </div>
        );
    }

    return (
        <div className="App relative">
            <Navbar />
            <Container className="mx-auto">
                <Header isSmallScreen={isSmallScreen} className='mb-4'>The Rewarder</Header>
                <Description isSmallScreen={isSmallScreen} className='mb-8'>Stake and level up for airdrops</Description>

                <Routes>
                    <Route path='/' element={<Main />} />
                    <Route path='/pool' element={<PoolView />} />
                </Routes>

            </Container >
            <ToastContainer />

            <Quu>Quu is king</Quu>

            <Disclaimer></Disclaimer>
        </div >
    );
}

export default App;
