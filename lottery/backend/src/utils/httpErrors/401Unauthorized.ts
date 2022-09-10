import HttpError from "./HttpError";

export default class HttpErrorUnauthorized extends HttpError {
    constructor() {
        super(401, 'Unauthorized');
    }
}