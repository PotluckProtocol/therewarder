class SimpleCache<T> {

    private cache: { [key: string]: { expiresIn?: number, item: T } } = {}

    public add(key: string, item: T, opts: { expiresAfterSeconds?: number } = {}) {

        let expiresIn;
        if (opts.expiresAfterSeconds) {
            const d = new Date();
            d.setSeconds(d.getSeconds() + opts.expiresAfterSeconds);
            expiresIn = d.valueOf();
        }

        this.cache[key] = {
            expiresIn,
            item
        }
    }

    public get(key: string): T | null {
        console.log(this.cache, this.cache[key]);
        const hit = this.cache[key];
        if (!hit) {
            return null;
        }

        if (hit.expiresIn && hit.expiresIn <= Date.now()) {
            return null;
        }

        return hit.item;
    }

}

export default SimpleCache;