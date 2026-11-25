
import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

const generateSignature = (nonce) => {
    return crypto
        .createHmac("sha256", process.env.CSRF_SECRET)
        .update(nonce)
        .digest("base64url");
};

const isValidToken = (token) => {
    if (typeof token !== "string" || token.length > 200) {
        return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
        return false;
    }

    const [nonce, signature] = parts;

    if (
        !/^[a-f0-9]{64}$/.test(nonce) ||
        !/^[A-Za-z0-9_-]{43}$/.test(signature)
    ) {
        return false;
    }

    const expectedSignature = generateSignature(nonce);

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    return (
        actualBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    );
};

export const issueCsrfToken = (req, res) => {
    const nonce = crypto.randomBytes(32).toString("hex");

    const signature = generateSignature(nonce);

    const token = `${nonce}.${signature}`;

    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        csrfToken: token
    });
};

export const verifyCsrfToken = (req, res, next) => {
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.get(CSRF_HEADER_NAME);

    if (
        typeof cookieToken !== "string" ||
        typeof headerToken !== "string" ||
        cookieToken !== headerToken ||
        !isValidToken(cookieToken)
    ) {
        return res.status(403).json({
            success: false,
            message: "Invalid or missing CSRF token"
        });
    }

    return next();
};
