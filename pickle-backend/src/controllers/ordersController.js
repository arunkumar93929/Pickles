
import mongoose from "mongoose";
import Product from "../models/products.js";
import Order from "../models/orders.js";
import { createHash } from "crypto";

const normalizeString = value =>
    typeof value === "string" ? value.trim() : "";


const createRequestHash = ({ customer, deliveryAddress, items }) => {
    const normalizedPayload = {
        customer: {
            fullName: customer.fullName.trim(),
            mobile: customer.mobile.trim(),
            alternateMobile: customer.alternateMobile?.trim() || ""
        },
        deliveryAddress: {
            houseOrFlat: deliveryAddress.houseOrFlat.trim(),
            street: deliveryAddress.street.trim(),
            villageOrCity: deliveryAddress.villageOrCity.trim(),
            district: deliveryAddress.district.trim(),
            state: deliveryAddress.state.trim(),
            pinCode: deliveryAddress.pinCode.trim(),
            landmark: deliveryAddress.landmark?.trim() || "",
            deliveryInstructions:
                deliveryAddress.deliveryInstructions?.trim() || ""
        },
        items: items.map(item => ({
            productId: item.productId.toString(),
            sizeLabel: item.sizeLabel.trim(),
            quantity: item.quantity
        }))
    };

    const serializedPayload = JSON.stringify(normalizedPayload);

    return createHash("sha256")
        .update(serializedPayload)
        .digest("hex");
};

// CREATE CUSTOMER ORDER
export const createOrder = async (req, res) => {
    try {
        const { customer, deliveryAddress, items } = req.body || {};
        // Validate idempotency key
const idempotencyKey = req.get("Idempotency-Key");

if (
    typeof idempotencyKey !== "string" ||
    idempotencyKey.length < 16 ||
    idempotencyKey.length > 128 ||
    !/^[a-zA-Z0-9_-]+$/.test(idempotencyKey)
) {
    return res.status(400).json({
        success: false,
        message: "A valid Idempotency-Key header is required"
    });
}

        // Validate required customer information
        if (
            !customer?.fullName ||
            !customer?.mobile ||
            !deliveryAddress
        ) {
            return res.status(400).json({
                success: false,
                message: "Customer information and delivery address are required"
            });
        }

        // Validate mobile numbers
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!mobileRegex.test(customer.mobile)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number"
            });
        }

        if (
            customer.alternateMobile &&
            !mobileRegex.test(customer.alternateMobile)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid alternate mobile number"
            });
        }

        // Validate delivery address
        const requiredAddressFields = [
            "houseOrFlat",
            "street",
            "villageOrCity",
            "district",
            "state",
            "pinCode"
        ];

        for (const field of requiredAddressFields) {
            if (
                typeof deliveryAddress[field] !== "string" ||
                !deliveryAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        if (!/^\d{6}$/.test(deliveryAddress.pinCode)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit PIN code"
            });
        }

        // Validate order items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart must contain at least one product"
            });
        }

        if (items.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Too many different items in one order"
            });
        }

        // Validate each cart item
        for (const item of items) {
            if (
                !mongoose.Types.ObjectId.isValid(item.productId) ||
                !item.sizeLabel ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product, size or quantity in cart"
                });
            }
        }
        const requestHash = createRequestHash({
            customer,
            deliveryAddress,
            items
    });
    // Check for an existing order with this idempotency key
const existingOrder = await Order.findOne({
    idempotencyKey
}).select("+requestHash");

if (existingOrder) {
    // Reject reuse of the same key with different checkout data
    if (existingOrder.requestHash !== requestHash) {
        return res.status(409).json({
            success: false,
            message: "This Idempotency-Key has already been used for a different order"
        });
    }

    // Return the previously created order
    return res.status(200).json({
        success: true,
        message: "This order has already been placed",
        replayed: true,
        order: {
            orderReference: existingOrder.orderReference,
            totalAmount: existingOrder.totalAmount,
            createdAt: existingOrder.createdAt
        }
    });
}

        // Retrieve actual products from MongoDB
        const productIds = [
            ...new Set(items.map(item => item.productId))
        ];

        const products = await Product.find({
            _id: { $in: productIds }
        });

        const productMap = new Map(
            products.map(product => [
                product._id.toString(),
                product
            ])
        );

        // Build order items using database prices
        const orderItems = [];

        let totalAmount = 0;

        for (const item of items) {
            const product = productMap.get(item.productId);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`
                });
            }

            const selectedSize = product.sizes.find(
                size => size.label === item.sizeLabel
            );

            if (!selectedSize) {
                return res.status(400).json({
                    success: false,
                    message: `Selected size is unavailable for ${product.name}`
                });
            }

            const subtotal = selectedSize.price * item.quantity;

            orderItems.push({
                productId: product._id,
                productName: product.name,
                sizeLabel: selectedSize.label,
                weightInGrams: selectedSize.weightInGrams,
                quantity: item.quantity,
                unitPrice: selectedSize.price,
                subtotal
            });

            totalAmount += subtotal;
        }

        totalAmount = Number(totalAmount.toFixed(2));

        // Create order
        let order;

try {
    order = await Order.create({
        idempotencyKey,
        requestHash,
        customer: {
            fullName: customer.fullName,
            mobile: customer.mobile,
            alternateMobile: customer.alternateMobile || ""
        },
        deliveryAddress,
        items: orderItems,
        totalAmount
    });
} catch (error) {
    // Handle simultaneous requests using the same idempotency key
    if (
        error.code === 11000 &&
        error.keyPattern?.idempotencyKey
    ) {
        const duplicateOrder = await Order.findOne({
            idempotencyKey
        }).select("+requestHash");

        if (!duplicateOrder) {
            throw error;
        }

        if (duplicateOrder.requestHash !== requestHash) {
            return res.status(409).json({
                success: false,
                message: "This Idempotency-Key has already been used for a different order"
            });
        }

        return res.status(200).json({
            success: true,
            message: "This order has already been placed",
            replayed: true,
            order: {
                orderReference: duplicateOrder.orderReference,
                totalAmount: duplicateOrder.totalAmount,
                createdAt: duplicateOrder.createdAt
            }
        });
    }

    throw error;
}
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: {
                orderReference: order.orderReference,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error("Create order error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Order validation failed",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to place order"
        });
    }
};
