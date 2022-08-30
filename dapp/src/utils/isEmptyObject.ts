const isEmptyObject = (obj: any): boolean => {
    try {
        return JSON.stringify(obj) === '{}';
    } catch (e) {
        return false;
    }
}

export default isEmptyObject;