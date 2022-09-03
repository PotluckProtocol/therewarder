import { Request } from "express";
import RequestWithUser from "../handlers/RequestWithUser";

const getSignatureFromRequest = (req: Request): string | null => {
    try {
        return (req as RequestWithUser).user.signature;
    } catch (e) {
        return null;
    }
}

export default getSignatureFromRequest;