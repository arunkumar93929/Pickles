
import mongoose from "mongoose";
import Order from "../models/orders.js";

// GET ALL ORDERS

export const getAllOrders = async (req, res) => {
    try {
        const pageParam = req.query.page ?? "1";
        const limitParam = req.query.limit ?? "10";

        // Validate pagination parameters
        if (
            typeof pageParam !== "string" ||
            typeof limitParam !== "string" ||
            !/^[1-9]\d*$/.test(pageParam) ||
            !/^[1-9]\d*$/.test(limitParam)
        ) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive integers"
            });
        }

        const page = Number(pageParam);
        const limit = Number(limitParam);

        if (
            !Number.isSafeInteger(page) ||
            !Number.isSafeInteger(limit) ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination values. Maximum limit is 100"
            });
        }

        const skip = (page - 1) * limit;

        if (!Number.isSafeInteger(skip)) {
            return res.status(400).json({
                success: false,
                message: "Requested page is too large"
            });
        }

        // Retrieve orders and total count concurrently
        const [orders, totalOrders] = await Promise.all([
            Order.find()
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .select("-__v")
                .lean(),

            Order.countDocuments()
        ]);

        const totalPages = Math.ceil(totalOrders / limit);

        return res.status(200).json({
            success: true,
            count: orders.length,
            pagination: {
                currentPage: page,
                limit,
                totalOrders,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1 && totalOrders > 0
            },
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve orders"
        });
    }
};


// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id).select("-__v");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve order details"
        });
    }
};
