
const CART_KEY = "shadruchulu_cart";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

function isValidQuantity(quantity) {
    return Number.isInteger(quantity) &&
        quantity >= MIN_QUANTITY &&
        quantity <= MAX_QUANTITY;
}

function normalizeCartItem(item) {
    if (
        !item ||
        typeof item !== "object" ||
        typeof item.key !== "string" ||
        !item.key ||
        typeof item.productId !== "string" ||
        !item.productId ||
        typeof item.name !== "string" ||
        !item.name
    ) {
        return null;
    }

    const quantity = Number(item.quantity);

    return {
        ...item,
        quantity: isValidQuantity(quantity)
            ? quantity
            : MIN_QUANTITY,
        sizeLabel: item.sizeLabel || item.weight || "",
        image: typeof item.image === "string" ? item.image : ""
    };
}

export function getCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);

        if (!saved) return [];

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) return [];

        return parsed
            .map(normalizeCartItem)
            .filter(Boolean);
    } catch {
        return [];
    }
}

export function saveCart(cart) {
    if (!Array.isArray(cart)) {
        throw new Error("Invalid cart data");
    }

    const normalizedCart = cart
        .map(normalizeCartItem)
        .filter(Boolean);

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(normalizedCart)
    );

    window.dispatchEvent(
        new Event("shadruchulu-cart-updated")
    );
}

export function addToCart(product, sizeLabel, quantity = 1) {
    if (
        !product?._id ||
        !sizeLabel ||
        !isValidQuantity(quantity)
    ) {
        throw new Error("Invalid product or cart details");
    }

    const selectedSize = product.sizes?.find(
        (size) => size.label === sizeLabel
    );

    if (!selectedSize) {
        throw new Error("Selected product size is unavailable");
    }

    const unitPrice = Number(selectedSize.price);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new Error("Invalid product price");
    }

    const cart = getCart();

    const key = `${product._id}-${selectedSize.label}`;

    const existing = cart.find(
        (item) => item.key === key
    );

    if (existing) {
        existing.quantity = Math.min(
            MAX_QUANTITY,
            existing.quantity + quantity
        );

        existing.unitPrice = unitPrice;
        existing.name = product.name;
        existing.image = product.images?.[0]?.url || "";
        existing.category = product.category;
    } else {
        cart.push({
            key,
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url || "",
            category: product.category,
            weight: selectedSize.label,
            sizeLabel: selectedSize.label,
            quantity,
            unitPrice
        });
    }

    saveCart(cart);

    return cart;
}

export function getCartCount() {
    return getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );
}
