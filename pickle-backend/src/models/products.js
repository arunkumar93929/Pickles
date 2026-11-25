
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true
        },
        publicId: {
            type: String,
            required: [true, "Image public ID is required"],
            trim: true
        }
    },
    { _id: false }
);

const sizeSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: [true, "Product size is required"],
            trim: true
        },
        weightInGrams: {
            type: Number,
            required: [true, "Product weight is required"],
            min: [250, "Product weight must be at least 250 grams"]        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0.01, "Price must be greater than zero"]
        }
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [3, "Product name must contain at least 3 characters"],
            maxlength: [100, "Product name cannot exceed 100 characters"]
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minlength: [10, "Description must contain at least 10 characters"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            trim: true,
            minlength: [3, "Category must contain at least 3 characters"],
            maxlength: [50, "Category cannot exceed 50 characters"]
        },

        images: {
            type: [imageSchema],
            required: true,
            validate: {
            validator: images =>
                Array.isArray(images) &&
                images.length >= 1 &&
                images.length <= 5,
                message: "A product must have between 1 and 5 images"
        }
        },
    
        sizes: {
            type: [sizeSchema],
            required: true,
            validate: [
                {
                    validator: sizes => sizes.length > 0,
                    message: "A product must have at least one size"
                },
                {
                    validator: sizes => {
                        const labels = sizes.map(size =>size.label.trim().replace(/\s+/g, "").toLowerCase());
                        return new Set(labels).size === labels.length;
                    },
                    message: "Duplicate product sizes are not allowed"
                },
                {
                    validator: sizes => {
                        const weights = sizes.map(size => size.weightInGrams);
                        return new Set(weights).size === weights.length;
                    },
                    message: "Duplicate product weights are not allowed"
                }
            ]
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
