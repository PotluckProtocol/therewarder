import { Request } from "express";

type RequestWithUser = Request & {
    user: {
        signature: string;
        signatureMessage: string;
    }
}

export default RequestWithUser;