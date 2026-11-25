
import mongoose from "mongoose";
import { randomUUID } from "crypto";

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productName: {
            type: String,
            required: true,
            trim: true
        },
        sizeLabel: {
            type: String,
            required: true,
            trim: true
        },
        weightInGrams: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                 validator: Number.isInteger,
                 message: "Weight must be a whole number"
            }
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be a whole number"
            }
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0.01
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0.01
        }
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        houseOrFlat: {
            type: String,
            required: true,
            trim: true
        },
        street: {
            type: String,
            required: true,
            trim: true
        },
        villageOrCity: {
            type: String,
            required: true,
            trim: true
        },
        district: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pinCode: {
            type: String,
            required: true,
            trim: true
        },
        landmark: {
            type: String,
            trim: true,
            default: ""
        },
        deliveryInstructions: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {

    idempotencyKey: {
        type: String,
        select: false
    },

    requestHash: {
        type: String,
        select: false
    },

        orderReference: {
            type: String,
            unique: true,
            default: () => `PKL-${randomUUID().slice(0, 8).toUpperCase()}`
        },

        customer: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },
            mobile: {
                type: String,
                required: true,
                trim: true
            },
            alternateMobile: {
                type: String,
                trim: true,
                default: ""
            }
        },

        deliveryAddress: {
            type: addressSchema,
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: items => items.length > 0,
                message: "An order must contain at least one product"
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0.01
        }
    },
    { timestamps: true }
);
// Prevent duplicate orders using the same idempotency key
orderSchema.index(
    { idempotencyKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            idempotencyKey: { $type: "string" }
        },
        name: "unique_idempotency_key"
    }
);

// Optimize admin order listing and pagination
orderSchema.index(
    { createdAt: -1, _id: -1 },
    { name: "orders_createdAt_id_desc" }
);

// Compile the model after defining all schema indexes
const Order = mongoose.model("Order", orderSchema);

export default Order;