
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Trash2
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCart, saveCart } from "../utils/cart";

const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

function isValidPrice(price) {
    const value = Number(price);

    return Number.isFinite(value) && value > 0;
}

function isValidQuantity(quantity) {
    return (
        Number.isInteger(quantity) &&
        quantity >= 1 &&
        quantity <= 20
    );
}

function Cart() {
    const [cart, setCart] = useState(() => getCart());

    useEffect(() => {
        const refresh = () => setCart(getCart());

        window.addEventListener("shadruchulu-cart-updated", refresh);
        window.addEventListener("storage", refresh);

        return () => {
            window.removeEventListener(
                "shadruchulu-cart-updated",
                refresh
            );

            window.removeEventListener("storage", refresh);
        };
    }, []);

    const updateQuantity = (key, amount) => {
        if (!Number.isInteger(amount)) return;

        const updated = cart.map((item) => {
            if (item.key !== key) return item;

            const currentQuantity = isValidQuantity(item.quantity)
                ? item.quantity
                : 1;

            return {
                ...item,
                quantity: Math.max(
                    1,
                    Math.min(20, currentQuantity + amount)
                )
            };
        });

        setCart(updated);
        saveCart(updated);
    };

    const removeItem = (key) => {
        const updated = cart.filter(
            (item) => item.key !== key
        );

        setCart(updated);
        saveCart(updated);
    };

    const clearCart = () => {
        setCart([]);
        saveCart([]);
    };

    const itemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cart.reduce((total, item) => {
        const unitPrice = Number(item.unitPrice);

        if (
            !isValidPrice(unitPrice) ||
            !isValidQuantity(item.quantity)
        ) {
            return total;
        }

        return total + unitPrice * item.quantity;
    }, 0);

    const hasInvalidItems = cart.some(
        (item) =>
            !isValidPrice(item.unitPrice) ||
            !isValidQuantity(item.quantity) ||
            !item.productId ||
            !item.sizeLabel
    );

    return (
        <>
            <Navbar />

            <main className="min-h-[65vh] bg-[#FAF5EB] px-5 py-12 lg:px-10 lg:py-16">
                <div className="mx-auto max-w-6xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">
                        Your basket
                    </p>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-4xl text-[#33251F] md:text-5xl">
                                Your Shopping Cart
                            </h1>

                            <p className="mt-2 text-sm text-[#827365]">
                                {itemCount} {itemCount === 1 ? "item" : "items"} in your basket
                            </p>
                        </div>

                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-xs font-semibold uppercase tracking-wider text-[#8E2922] underline underline-offset-4"
                            >
                                Clear cart
                            </button>
                        )}
                    </div>

                    {cart.length === 0 ? (
                        <div className="mx-auto max-w-lg py-20 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]">
                                <ShoppingBag size={28} />
                            </div>

                            <h2 className="mt-6 font-serif text-3xl text-[#33251F]">
                                Your cart is waiting.
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-[#65564C]">
                                Explore our collection and find your favourite Andhra flavours.
                            </p>

                            <Link
                                to="/shop"
                                className="mt-8 inline-flex items-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white hover:bg-[#702019]"
                            >
                                Explore Pickles
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
                            <div className="border-y border-[#E5D8C6]">
                                {cart.map((item) => {
                                    const unitPrice = Number(item.unitPrice);
                                    const quantity = item.quantity;
                                    const sizeLabel = item.sizeLabel || item.weight;
                                    const validPrice = isValidPrice(unitPrice);
                                    const validQuantity = isValidQuantity(quantity);

                                    return (
                                        <article
                                            key={item.key}
                                            className="flex gap-4 border-b border-[#E5D8C6] py-5 last:border-b-0 sm:gap-6"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-28 w-24 shrink-0 bg-[#E8DDCE] object-cover sm:h-36 sm:w-32"
                                                />
                                            ) : (
                                                <div className="grid h-28 w-24 shrink-0 place-items-center bg-[#E8DDCE] text-xs text-[#827365] sm:h-36 sm:w-32">
                                                    No image
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h2 className="font-serif text-xl text-[#33251F]">
                                                            {item.name}
                                                        </h2>

                                                        <p className="mt-1 text-xs text-[#827365]">
                                                            Pack size: {sizeLabel || "Unavailable"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.key)}
                                                        aria-label={`Remove ${item.name}`}
                                                        className="p-1 text-[#8E2922] hover:text-[#702019]"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>

                                                <p className="mt-3 text-sm font-semibold text-[#8E2922]">
                                                    {validPrice
                                                        ? formatPrice(unitPrice)
                                                        : "Invalid price"}

                                                    {validPrice && (
                                                        <span className="text-xs font-normal text-[#827365]">
                                                            {" "}per pack
                                                        </span>
                                                    )}
                                                </p>

                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                                    <div className="inline-flex h-9 items-center border border-[#D9C9B5] bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.key, -1)}
                                                            disabled={quantity <= 1}
                                                            aria-label="Decrease quantity"
                                                            className="px-3 text-[#8E2922] disabled:opacity-40"
                                                        >
                                                            <Minus size={13} />
                                                        </button>

                                                        <span className="min-w-7 text-center text-xs font-semibold">
                                                            {quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.key, 1)}
                                                            disabled={quantity >= 20}
                                                            aria-label="Increase quantity"
                                                            className="px-3 text-[#8E2922] disabled:opacity-40"
                                                        >
                                                            <Plus size={13} />
                                                        </button>
                                                    </div>

                                                    <p className="text-sm font-semibold text-[#33251F]">
                                                        {validPrice && validQuantity
                                                            ? formatPrice(unitPrice * quantity)
                                                            : "Subtotal unavailable"}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <aside className="bg-[#F3E9D8] p-6 sm:p-7">
                                <h2 className="font-serif text-2xl text-[#33251F]">
                                    Order Summary
                                </h2>

                                <div className="mt-5 flex justify-between border-b border-[#D9C9B5] pb-4 text-sm text-[#65564C]">
                                    <span>Total items</span>

                                    <span className="font-semibold text-[#33251F]">
                                        {itemCount}
                                    </span>
                                </div>

                                <div className="mt-4 flex justify-between text-sm text-[#65564C]">
                                    <span>Subtotal</span>

                                    <span className="font-semibold text-[#33251F]">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                <div className="mt-4 border-t border-[#D9C9B5] pt-4">
                                    <div className="flex justify-between gap-3">
                                        <span className="font-semibold text-[#33251F]">
                                            Estimated total
                                        </span>

                                        <span className="font-serif text-xl text-[#8E2922]">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs leading-6 text-[#827365]">
                                        Delivery charges, if applicable, will be confirmed separately.
                                        Final product prices are verified by the server during checkout.
                                    </p>
                                </div>

                                {hasInvalidItems && (
                                    <p className="mt-4 text-xs leading-5 text-[#8E2922]">
                                        One or more cart items have invalid details.
                                        Remove those items and add them again from the Shop page.
                                    </p>
                                )}

                                <Link
                                    to="/checkout"
                                    className={`mt-7 flex w-full items-center justify-center gap-2 bg-[#8E2922] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#702019] ${
                                        hasInvalidItems
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }`}
                                    aria-disabled={hasInvalidItems}
                                    onClick={(event) => {
                                        if (hasInvalidItems) {
                                            event.preventDefault();
                                        }
                                    }}
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={16} />
                                </Link>

                                <Link
                                    to="/shop"
                                    className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#8E2922]"
                                >
                                    Continue Shopping
                                    <ArrowRight size={15} />
                                </Link>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Cart;
