import HttpError from "./HttpError";

export default class HttpErrorForbidden extends HttpError {
    constructor() {
        super(403, 'Forbidden');
    }
}