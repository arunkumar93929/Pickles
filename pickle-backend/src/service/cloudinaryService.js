
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Upload a single image to Cloudinary

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "pickle-store/products",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result?.secure_url || !result?.public_id) {
                    return reject(
                        new Error("Invalid Cloudinary upload response")
                    );
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        const readableStream = Readable.from(fileBuffer);

        readableStream.on("error", reject);
        uploadStream.on("error", reject);

        readableStream.pipe(uploadStream);
    });
};


// Upload multiple product images
export const uploadProductImages = async (files) => {
    const uploadedImages = [];

    try {
        for (const file of files) {
            const image = await uploadToCloudinary(file.buffer);

            uploadedImages.push(image);
        }

        return uploadedImages;

    
    } catch (error) {
        try {
            const cleanupResult = await deleteProductImages(uploadedImages);

            if (cleanupResult.failed.length > 0) {
                console.error(
                    "Failed to clean up partially uploaded images:",
                    cleanupResult.failed
                );
            }
        } catch (cleanupError) {
            console.error(
                "Cleanup failed after Cloudinary upload error:",
                cleanupError
            );
        }

        throw error;
    }
};


// Delete multiple product images

export const deleteProductImages = async (images) => {
    const results = await Promise.allSettled(
        images.map(image =>
            cloudinary.uploader.destroy(image.publicId)
        )
    );

    const deleted = [];
    const failed = [];

    results.forEach((result, index) => {
        const publicId = images[index].publicId;

        if (
            result.status === "fulfilled" &&
            ["ok", "not found"].includes(result.value?.result)
        ) {
            deleted.push(publicId);
        } else {
            failed.push({
                publicId,
                reason:
                    result.status === "rejected"
                        ? result.reason?.message || "Cloudinary deletion failed"
                        : result.value?.result || "Unexpected Cloudinary response"
            });
        }
    });

    if (failed.length > 0) {
        console.error("Cloudinary image cleanup failures:", failed);
    }

    return {
        deleted,
        failed
    };
};
