
import "./src/config/validateEnv.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received. Starting graceful shutdown...`);

            server.close(async (error) => {
                if (error) {
                    console.error("HTTP server shutdown failed:", error);
                    process.exit(1);
                }

                try {
                    await mongoose.connection.close();
                    console.log("MongoDB connection closed.");
                    process.exit(0);
                } catch (dbError) {
                    console.error("MongoDB shutdown failed:", dbError);
                    process.exit(1);
                }
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
