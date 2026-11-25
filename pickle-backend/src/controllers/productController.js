
import Product from "../models/products.js";

import {uploadProductImages,deleteProductImages} from "../service/cloudinaryService.js";


export const createProduct = async (req, res) => {
    let uploadedImages = [];

    try {
        // console.log("Request body:", req.body);
        // console.log("Uploaded files:", req.files);
        const { name, description, category, sizes } = req.body;

        // Step 1: Validate required fields
        if (!name || !description || !category || !sizes) {
            return res.status(400).json({
                success: false,
                message: "All product fields are required"
            });
        }

        // Step 2: Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required"
            });
        }

        // Step 3: Parse sizes
        let parsedSizes;

        try {
            parsedSizes = JSON.parse(sizes);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid sizes JSON format"
            });
        }

        if (!Array.isArray(parsedSizes)) {
            return res.status(400).json({
                success: false,
                message: "Sizes must be an array"
            });
        }

        // Step 4: Upload images to Cloudinary
        uploadedImages = await uploadProductImages(req.files);

        // Step 5: Create product in MongoDB
        const product = await Product.create({
            name,
            description,
            category,
            sizes: parsedSizes,
            images: uploadedImages
        });

        // Step 6: Send success response
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {

        // Step 7: Clean up uploaded images if product creation fails
        
if (uploadedImages.length > 0) {
    try {
        const cleanupResult = await deleteProductImages(uploadedImages);

        if (cleanupResult.failed.length > 0) {
            console.error(
                "Failed to clean up uploaded images:",
                cleanupResult.failed
            );
        }
    } catch (cleanupError) {
        console.error("Uploaded image cleanup error:", cleanupError);
    }
}


        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Product validation failed",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    let newlyUploadedImages = [];
    let databaseUpdateSucceeded = false;


    try {
        const { id } = req.params;
        const body = req.body || {};

//         console.log("UPDATE BODY:", req.body);
// console.log("UPDATE FILES:", req.files);

        // Validate MongoDB ID
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find existing product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Parse sizes if provided
        let parsedSizes;

        if (body.sizes !== undefined) {
            try {
                parsedSizes = JSON.parse(body.sizes);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sizes JSON format"
                });
            }

            if (!Array.isArray(parsedSizes)) {
                return res.status(400).json({
                    success: false,
                    message: "Sizes must be an array"
                });
            }
        }

        // Parse images requested for removal
        let removeImages = [];

        if (body.removeImages !== undefined) {
            try {
                removeImages = JSON.parse(body.removeImages);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid removeImages JSON format"
                });
            }

            if (
                !Array.isArray(removeImages) ||
                !removeImages.every(image => typeof image === "string")
            ) {
                return res.status(400).json({
                    success: false,
                    message: "removeImages must be an array of image public IDs"
                });
            }
        }

        const removeImageIds = [...new Set(removeImages)];

        // Ensure requested images belong to this product
        const existingPublicIds = product.images.map(
            image => image.publicId
        );

        const invalidImageIds = removeImageIds.filter(
            publicId => !existingPublicIds.includes(publicId)
        );

        if (invalidImageIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: "One or more images do not belong to this product"
            });
        }

        // Calculate remaining images
        const remainingImages = product.images.filter(
            image => !removeImageIds.includes(image.publicId)
        );

        const newFiles = req.files || [];

        if (remainingImages.length + newFiles.length > 5) {
            return res.status(400).json({
                success: false,
                message: "A product cannot have more than 5 images"
            });
        }

        // Check whether anything was provided for updating
        const hasDetails =
            body.name !== undefined ||
            body.description !== undefined ||
            body.category !== undefined ||
            parsedSizes !== undefined;

        if (
            !hasDetails &&
            removeImageIds.length === 0 &&
            newFiles.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "No update information provided"
            });
        }

        // Update basic product details only when provided
        if (body.name !== undefined) {
            product.name = body.name;
        }

        if (body.description !== undefined) {
            product.description = body.description;
        }

        if (body.category !== undefined) {
            product.category = body.category;
        }

        if (parsedSizes !== undefined) {
            product.sizes = parsedSizes;
        }

        // Upload new images
        if (newFiles.length > 0) {
            newlyUploadedImages = await uploadProductImages(newFiles);
        }

        // Combine remaining and newly uploaded images
        product.images = [
            ...remainingImages,
            ...newlyUploadedImages
        ];

        // Save updated product first
        await product.save();
        databaseUpdateSucceeded = true;

        // Delete removed images from Cloudinary after successful save
       
// Delete removed images from Cloudinary after successful save
const imagesToDelete = removeImageIds.map(publicId => ({
    publicId
}));

if (imagesToDelete.length > 0) {
    try {
        const cleanupResult = await deleteProductImages(imagesToDelete);

        if (cleanupResult.failed.length > 0) {
            console.error(
                "Some removed product images could not be deleted from Cloudinary:",
                cleanupResult.failed
            );
        }
    } catch (cleanupError) {
        console.error(
            "Cloudinary cleanup error after product update:",
            cleanupError
        );
    }
}

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {

        // Clean up newly uploaded images if the database update fails
       
if (!databaseUpdateSucceeded && newlyUploadedImages.length > 0) {
    try {
        const cleanupResult = await deleteProductImages(newlyUploadedImages);

        if (cleanupResult.failed.length > 0) {
            console.error(
                "Failed to clean up newly uploaded images:",
                cleanupResult.failed
            );
        }
    } catch (cleanupError) {
        console.error("Newly uploaded image cleanup error:", cleanupError);
    }
}


        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Product validation failed",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


export const getAllProducts = async (req, res) => {
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

        // Fetch products and total count concurrently
        const [products, totalProducts] = await Promise.all([
            Product.find()
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            success: true,
            count: products.length,
            pagination: {
                currentPage: page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1 && totalProducts > 0
            },
            products
        });

    } catch (error) {
        console.error("Get all products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve products"
        });
    }
};


export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
         next(error);
   
    }
};


 // DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Store image information before deleting product
        const productImages = product.images.map(image => ({
            publicId: image.publicId
        }));

        // Delete product from MongoDB
       
 // Delete product from MongoDB
await Product.findByIdAndDelete(id);

// Delete associated images from Cloudinary

// Delete associated images from Cloudinary
if (productImages.length > 0) {
    try {
        const cleanupResult = await deleteProductImages(productImages);

        if (cleanupResult.failed.length > 0) {
            console.error(
                "Some product images could not be deleted from Cloudinary:",
                cleanupResult.failed
            );
        }
    } catch (cleanupError) {
        console.error(
            "Cloudinary cleanup error after product deletion:",
            cleanupError
        );
    }
}



        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
};

