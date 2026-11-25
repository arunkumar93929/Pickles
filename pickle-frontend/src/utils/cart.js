
const CART_KEY = "shadruchulu_cart";

export function getCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("shadruchulu-cart-updated"));
}

export function addToCart(product, sizeLabel, quantity = 1) {
    if (!product?._id || !sizeLabel || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid product or cart details");
    }

    const selectedSize = product.sizes?.find(
        (size) => size.label === sizeLabel
    );

    if (!selectedSize) {
        throw new Error("Selected product size is unavailable");
    }

    const cart = getCart();

    const key = `${product._id}-${selectedSize.label}`;

    const existing = cart.find((item) => item.key === key);

    if (existing) {
        existing.quantity = Math.min(20, existing.quantity + quantity);
        existing.unitPrice = selectedSize.price;
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
            unitPrice: selectedSize.price
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
