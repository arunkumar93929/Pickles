import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";

const createOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password || password.length < 12) {
            throw new Error(
                "Configure ADMIN_EMAIL and a password of at least 12 characters"
            );
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log("Owner account already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await Admin.create({
            email,
            password: hashedPassword,
            role: "owner"
        });

        console.log("Owner account created successfully.");

    } catch (error) {
        console.error("Owner creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createOwner();
