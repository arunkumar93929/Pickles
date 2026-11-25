
import Order from "../models/orders.js";
import Product from "../models/products.js";

export const getDashboardSummary = async (req, res) => {
    try {
        const [
            totalOrders,
            orderValueResult,
            totalProducts,
            recentOrders
        ] = await Promise.all([
            Order.countDocuments(),

            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]),

            Product.countDocuments(),

            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("orderReference customer items totalAmount createdAt")
        ]);

        const totalOrderValue = orderValueResult.length > 0
            ? Number(orderValueResult[0].total.toFixed(2))
            : 0;

        return res.status(200).json({
            success: true,
            dashboard: {
                totalOrders,
                totalOrderValue,
                totalProducts,
                recentOrders
            }
        });

    } catch (error) {
        console.error("Dashboard summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard summary"
        });
    }
};
