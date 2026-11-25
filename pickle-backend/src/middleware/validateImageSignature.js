
const validateImageSignature = (req, res, next) => {
    const files = req.files || [];

    const isValidImage = (buffer, mimetype) => {
        if (!buffer || buffer.length < 12) {
            return false;
        }

        // JPEG signature
        if (mimetype === "image/jpeg") {
            return (
                buffer[0] === 0xFF &&
                buffer[1] === 0xD8 &&
                buffer[2] === 0xFF
            );
        }

        // PNG signature
        if (mimetype === "image/png") {
            return buffer.subarray(0, 8).equals(
                Buffer.from([
                    0x89, 0x50, 0x4E, 0x47,
                    0x0D, 0x0A, 0x1A, 0x0A
                ])
            );
        }

        // WEBP signature
        if (mimetype === "image/webp") {
            return (
                buffer.toString("ascii", 0, 4) === "RIFF" &&
                buffer.toString("ascii", 8, 12) === "WEBP"
            );
        }

        return false;
    };

    const invalidFiles = files.filter(
        file => !isValidImage(file.buffer, file.mimetype)
    );

    if (invalidFiles.length > 0) {
        return res.status(400).json({
            success: false,
            message: "One or more uploaded files have an invalid image format"
        });
    }

    next();
};

export default validateImageSignature;
