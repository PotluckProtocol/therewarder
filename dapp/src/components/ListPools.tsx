import styled from "styled-components";
import useUser from "../account/useUser";
import { useAllPoolsBaseInfo } from "../pools/useAllPoolsBaseInfo"
import PoolItem from "./PoolItem";

export type ListPoolsProps = {
    mode: 'basic' | 'ended';
}

const Container = styled.div`
    position: relative;
`;

const PoolItemWrapper = styled.div`
    max-width: 450px;
    width: 100%;
`;

export const ListPools: React.FC<ListPoolsProps> = (props) => {
    const allPools = useAllPoolsBaseInfo();

    return (
        <div className="relative">
            <Container className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {allPools.map((pool, index) => (
                    <PoolItemWrapper className="mx-auto" key={index}>
                        <PoolItem className="mx-auto"
                            baseInfo={pool}
                            mode={props.mode}
                        />
                    </PoolItemWrapper>
                ))}
            </Container>
        </div>
    )

}