
import "dotenv/config";

const requiredVariables = [
    "MONGODB_URI",
    "CLIENT_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CSRF_SECRET"

];
if (process.env.CSRF_SECRET.length < 32) {
    console.error(
        "CSRF_SECRET must contain at least 32 characters."
    );

    process.exit(1);
}

const missingVariables = requiredVariables.filter(
    variable => !process.env[variable]?.trim()
);

if (missingVariables.length > 0) {
    console.error(
        "Missing required environment variables:",
        missingVariables.join(", ")
    );

    process.exit(1);
}

// JWT secret validation
if (process.env.JWT_SECRET.length < 32) {
    console.error(
        "JWT_SECRET must contain at least 32 characters."
    );

    process.exit(1);
}

// JWT expiration validation
const jwtExpiration = process.env.JWT_EXPIRES_IN.trim();

if (!/^[1-9]\d*(s|m|h|d|w|y)$/.test(jwtExpiration)) {
    console.error(
        "JWT_EXPIRES_IN must be a positive duration such as 15m, 1h or 1d."
    );

    process.exit(1);
}

// Frontend origin validation
try {
    const clientUrl = new URL(process.env.CLIENT_URL.trim());

    if (
        !["http:", "https:"].includes(clientUrl.protocol) ||
        clientUrl.origin !== process.env.CLIENT_URL.trim()
    ) {
        throw new Error("Invalid client origin");
    }
} catch {
    console.error(
        "CLIENT_URL must be a valid HTTP or HTTPS origin without a path."
    );

    process.exit(1);
}

// Port validation
if (process.env.PORT) {
    const port = Number(process.env.PORT);

    if (
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535
    ) {
        console.error(
            "PORT must be a valid port between 1 and 65535."
        );

        process.exit(1);
    }
}

// Environment validation
const allowedEnvironments = [
    "development",
    "production",
    "test"
];

if (
    process.env.NODE_ENV &&
    !allowedEnvironments.includes(process.env.NODE_ENV)
) {
    console.error("Invalid NODE_ENV value.");
    process.exit(1);
}

console.log("Environment configuration validated successfully.");
