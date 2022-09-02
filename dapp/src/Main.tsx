import React, { ComponentPropsWithoutRef, useContext, useEffect, useState } from 'react';
import Switch from 'react-switch';
import styled, { CSSProperties } from 'styled-components';
import { ListPools } from './components/ListPools';
import 'react-toastify/dist/ReactToastify.css';
import useUser from './account/useUser';
import { Loading } from './components/Loading'
import { ButtonGroup, GroupButton } from './components/ButtonGroup';

type DescriptionProps = ComponentPropsWithoutRef<'p'> & {
    harvestMode: boolean;
}

type SwitchLabelProps = {
    active: boolean;
}

type View = 'open' | 'ended';

const buttonGroupStyle: CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.45)'
}

export const Main: React.FC = () => {

    const user = useUser();
    const [mode, setMode] = useState<'basic' | 'ended'>('basic')
    const [view, setView] = useState<View>('open');

    if (!user.isInitialized) {
        return (
            <div className="mt-12 flex justify-center ">
                <Loading size={15} width={150} />
            </div>
        );
    }

    const handleViewChange = (buttonGroup: GroupButton) => {
        const nextView = buttonGroup.value as View;
        setView(nextView);

        // Change also to mode to match the view 
        setMode(nextView === 'ended' ? 'ended' : 'basic');
    }

    const buttonGroup: GroupButton[] = [{
        text: 'Active',
        value: 'open',
        active: view === 'open'
    }, {
        text: 'Ended',
        value: 'ended',
        active: view === 'ended'
    }];

    return (
        <div>
            <div className='flex justify-center mb-6'>
                <ButtonGroup buttonStyle={buttonGroupStyle} buttons={buttonGroup} onSelect={handleViewChange} />
            </div>

            <div>
                <ListPools
                    mode={mode}
                />
            </div>

        </div>
    );
}

export default Main;
