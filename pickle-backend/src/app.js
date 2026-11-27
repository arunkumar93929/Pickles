
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
const app = express();

app.use(helmet());

app.use(cors({
    origin: [process.env.CLIENT_URL,"https://directed-replica-printed-hometown.trycloudflare.com"],
    credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ 
    extended: true,
    limit: "10kb",
    parameterLimit: 100
}));

app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Pickle Store API is running"
    });
});

app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});
// Centralized error handling middleware
app.use(errorMiddleware);

export default app;
