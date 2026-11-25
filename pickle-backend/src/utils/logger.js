
import winston from "winston";

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",

    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    transports: [
        new winston.transports.Console()
    ]
});

export default logger;
logger.info("Winston logger test successful");

