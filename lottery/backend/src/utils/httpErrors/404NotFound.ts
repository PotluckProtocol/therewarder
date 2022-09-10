import HttpError from "./HttpError";

export default class HttpErrorNotFound extends HttpError {
    constructor() {
        super(404, 'Not found');
    }
}