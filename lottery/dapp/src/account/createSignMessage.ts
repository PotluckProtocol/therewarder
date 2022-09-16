import STATIC_MESSAGE from "./STATIC_MESSAGE";

const createSignMessage = (): string => {
    const date = new Date();
    const prefix = `${date.getFullYear()}-${date.getMonth()}`
    return `${prefix}-${STATIC_MESSAGE}`;
}

export default createSignMessage;