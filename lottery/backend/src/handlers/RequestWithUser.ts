import { Request } from "express";

type RequestWithUser = Request & {
    user: {
        signature: string;
    }
}

export default RequestWithUser;