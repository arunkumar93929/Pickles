import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Admin email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, "Admin password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false
        },

        role: {
            type: String,
            enum: ["owner"],
            default: "owner"
        }
    },
    {
        timestamps: true
    }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
