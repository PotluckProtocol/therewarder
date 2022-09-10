import HttpError from "./HttpError";

export default class HttpErrorBadRequest extends HttpError {
    constructor() {
        super(400, 'Bad request');
    }
}