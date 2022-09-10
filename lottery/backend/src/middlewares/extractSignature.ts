import HttpErrorUnauthorized from "../utils/httpErrors/401Unauthorized";
import RequestWithUser from "../utils/RequestWithUser";

const extractSignatureMiddleware = (req, res, next) => {
    const authHeaderContent = req.header('auth');
    if (!authHeaderContent) {
        throw new HttpErrorUnauthorized();
    }

    let content: { signature: string, message: string };
    try {
        content = JSON.parse(Buffer.from(authHeaderContent as string, 'base64').toString());
        if (!content.message || !content.signature) {
            throw new Error();
        }
    } catch (e) {
        throw new HttpErrorUnauthorized();
    }

    (req as RequestWithUser).user = {
        signature: content.signature,
        signatureMessage: content.message
    }
    next();
}

export default extractSignatureMiddleware;