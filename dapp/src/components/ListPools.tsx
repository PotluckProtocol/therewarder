import styled from "styled-components";
import useUser from "../account/useUser";
import { useAllPoolsBaseInfo } from "../pools/useAllPoolsBaseInfo"
import PoolItem from "./PoolItem";

export type ListPoolsProps = {
    mode: 'basic' | 'ended';
}

type ContainerProps = {
    wrongNetwork: boolean;
}

const Container = styled.div<ContainerProps>`
    position: relative;
    
    ${props => props.wrongNetwork && (`
    &:after {
        position: absolute;
        content: ' ';
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        background-color: rgba(0,0,0,.8);
    }
    `)}
`;

const WrongNetworkInfo = styled.div`
    color: white;
    position: absolute;
    font-size: 1.3rem;
    top: 2rem;
    right: 0;
    left: 0;
    bottom: 0;
    text-align: center;
`;

const PoolItemWrapper = styled.div`
    max-width: 450px;
    width: 100%;
`;

export const ListPools: React.FC<ListPoolsProps> = (props) => {
    const allPools = useAllPoolsBaseInfo();
    const user = useUser();
    const wrongNetwork = !!user.account && ![250, 4002].includes(user.account.network.networkId);

    return (
        <div className="relative">
            <Container wrongNetwork={wrongNetwork} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {allPools.map((pool, index) => (
                    <PoolItemWrapper className="mx-auto" key={index}>
                        <PoolItem className="mx-auto"
                            baseInfo={pool}
                            mode={props.mode}
                        />
                    </PoolItemWrapper>
                ))}
            </Container>

            {wrongNetwork && (
                <WrongNetworkInfo>
                    Currently only Fantom Opera supported. Please change your network.
                </WrongNetworkInfo>
            )}
        </div>
    )

}