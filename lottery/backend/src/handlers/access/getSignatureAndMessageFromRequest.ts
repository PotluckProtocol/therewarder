import { Request } from "express";
import RequestWithUser from "../../utils/RequestWithUser";

const getSignatureAndMessageFromRequest = (
    req: Request
): { signature: string, signatureMessage: string } | null => {
    try {
        const { signature, signatureMessage } = (req as RequestWithUser).user;
        return { signature, signatureMessage };
    } catch (e) {
        return null;
    }
}

export default getSignatureAndMessageFromRequest;