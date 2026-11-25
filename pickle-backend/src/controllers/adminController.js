    import Admin from "../models/admin.js";
    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";



const durationToMilliseconds = (duration) => {
    const match = duration.match(/^([1-9]\d*)(s|m|h|d|w|y)$/);

    if (!match) {
        throw new Error("Invalid JWT expiration duration");
    }

    const value = Number(match[1]);

    const units = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        y: 365 * 24 * 60 * 60 * 1000
    };

    const milliseconds = value * units[match[2]];

    if (!Number.isSafeInteger(milliseconds)) {
        throw new Error("JWT expiration duration is too large");
    }

    return milliseconds;
};


const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: durationToMilliseconds(process.env.JWT_EXPIRES_IN),
    path: "/"
});


    export const adminLogin = async (req, res) => {
        try {
            const { email, password } = req.body || {};

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

            const admin = await Admin.findOne({
                email: email.toLowerCase().trim()
            }).select("+password");

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                admin.password
            );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
const expiresIn = process.env.JWT_EXPIRES_IN;
const cookieOptions = getCookieOptions();
            const token = jwt.sign(
                {
                    adminId: admin._id,
                    role: admin.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn
                }
            );

            res.cookie("adminToken", token, cookieOptions);

            return res.status(200).json({
                success: true,
                message: "Login successful",
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Admin login failed"
            });
        }
    };


    // GET AUTHENTICATED OWNER
    export const getAdminProfile = async (req, res) => {
        return res.status(200).json({
            success: true,
            admin: {
                id: req.admin._id,
                email: req.admin.email,
                role: req.admin.role
            }
        });
    };


    // OWNER LOGOUT
   export const adminLogout = async (req, res) => {
    const { maxAge, ...clearOptions } = getCookieOptions();

    res.clearCookie("adminToken", clearOptions);

    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};
