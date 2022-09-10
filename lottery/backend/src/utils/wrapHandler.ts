import { Handler } from "express";
import HttpError from "./httpErrors/HttpError";

const wrapHandler = (handler: Handler): Handler => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (e) {
            if (e instanceof HttpError) {
                return res.status(e.statusCode).send({ message: e.message });
            } else {
                throw e;
            }
        }
    }
}

export default wrapHandler;