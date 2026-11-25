
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
    logger.error("API Error", {
        method: req.method,
        path: req.originalUrl,
        message: err.message,
        statusCode: err.statusCode || 500,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    let message = "Internal server error";

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
    }

    // Invalid MongoDB ObjectId
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource identifier";
    }

    // MongoDB duplicate key error
    else if (err.code === 11000) {
        statusCode = 409;
        message = "A record with this information already exists";
    }

    // Explicitly trusted client errors
    else if (
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode < 500
    ) {
        statusCode = err.statusCode;
        message = err.message || "Request failed";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};

export default errorMiddleware;
