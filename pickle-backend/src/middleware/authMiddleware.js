
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

export const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const admin = await Admin.findById(decoded.adminId);

        if (!admin || admin.role !== "owner") {
            return res.status(401).json({
                success: false,
                message: "Admin account not found"
            });
        }

        req.admin = admin;

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};
