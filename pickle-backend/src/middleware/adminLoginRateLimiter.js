
import rateLimit from "express-rate-limit";

const adminLoginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
});

export default adminLoginRateLimiter;
