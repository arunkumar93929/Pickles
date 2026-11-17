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

export function addToCart(product, weight, quantity = 1) {
  const cart = getCart();
  const key = `${product.id}-${weight}`;
  const unitPrice = product.prices?.[weight] ?? 0;
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += quantity;
    existing.unitPrice = unitPrice;
  } else {
    cart.push({
      key,
      productId: product.id,
      name: product.name,
      image: product.image || "",
      category: product.category,
      weight,
      quantity,
      unitPrice,
    });
  }

  saveCart(cart);
  return cart;
}

export function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
