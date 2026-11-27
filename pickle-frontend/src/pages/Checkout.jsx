
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    PackageCheck,
    ShieldCheck,
    ShoppingBag,
    Truck
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { getCart, saveCart } from "../utils/cart";

const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

const initialForm = {
    fullName: "",
    mobile: "",
    alternateMobile: "",
    houseOrFlat: "",
    street: "",
    villageOrCity: "",
    district: "",
    state: "",
    pinCode: "",
    landmark: "",
    deliveryInstructions: ""
};


const getIdempotencyKey = async (payload) => {
    if (!globalThis.crypto?.subtle || !globalThis.crypto?.randomUUID) {
        throw new Error(
            "Your browser does not support secure checkout. Please use an updated browser over HTTPS."
        );
    }

    const serializedPayload = JSON.stringify(payload);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(serializedPayload)
    );

    const fingerprint = Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    const storageKey = "pickle_checkout_attempt";

    try {
        const previousAttempt = JSON.parse(
            sessionStorage.getItem(storageKey) || "null"
        );

        if (
            previousAttempt?.fingerprint === fingerprint &&
            typeof previousAttempt.key === "string"
        ) {
            return previousAttempt.key;
        }
    } catch {
        // Storage may be unavailable or contain invalid data.
    }

    const key = crypto.randomUUID();

    try {
        sessionStorage.setItem(
            storageKey,
            JSON.stringify({ fingerprint, key })
        );
    } catch {
        // The request can still proceed, but retry protection
        // may not survive if sessionStorage is unavailable.
    }

    return key;
};


function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(() => getCart());
    const [form, setForm] = useState(initialForm);
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const refreshCart = () => setCart(getCart());

        window.addEventListener("shadruchulu-cart-updated", refreshCart);
        window.addEventListener("storage", refreshCart);

        return () => {
            window.removeEventListener("shadruchulu-cart-updated", refreshCart);
            window.removeEventListener("storage", refreshCart);
        };
    }, []);

    const itemCount = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const subtotal = useMemo(
        () =>
            cart.reduce(
                (total, item) =>
                    total +
                    (Number(item.unitPrice) || 0) *
                        (Number(item.quantity) || 0),
                0
            ),
        [cart]
    );

    const hasInvalidCartItem = cart.some(
        (item) =>
            !item.productId ||
            !item.sizeLabel ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) < 1
    );

    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));

        setSubmitError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submitting) return;

        setSubmitError("");

        const latestCart = getCart();

        if (latestCart.length === 0) {
            setCart([]);
            setSubmitError(
                "Your cart is empty. Add some pickles before checkout."
            );
            return;
        }

        const mobile = form.mobile.replace(/\D/g, "");
        const alternateMobile = form.alternateMobile.replace(/\D/g, "");
        const pinCode = form.pinCode.replace(/\D/g, "");

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            setSubmitError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (
            alternateMobile &&
            !/^[6-9]\d{9}$/.test(alternateMobile)
        ) {
            setSubmitError(
                "Enter a valid 10-digit alternate mobile number."
            );
            return;
        }

        if (!/^\d{6}$/.test(pinCode)) {
            setSubmitError("Enter a valid 6-digit PIN code.");
            return;
        }

        const invalidItem = latestCart.some(
            (item) =>
                !item.productId ||
                !item.sizeLabel ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) < 1 ||
                Number(item.quantity) > 100
        );

        if (invalidItem) {
            setSubmitError(
                "Your cart contains invalid product details. Please return to the cart and add the products again."
            );
            return;
        }

        const payload = {
            customer: {
                fullName: form.fullName.trim(),
                mobile,
                alternateMobile
            },
            deliveryAddress: {
                houseOrFlat: form.houseOrFlat.trim(),
                street: form.street.trim(),
                villageOrCity: form.villageOrCity.trim(),
                district: form.district.trim(),
                state: form.state.trim(),
                pinCode,
                landmark: form.landmark.trim(),
                deliveryInstructions: form.deliveryInstructions.trim()
            },
            items: latestCart.map((item) => ({
                productId: item.productId,
                sizeLabel: item.sizeLabel,
                quantity: Number(item.quantity)
            }))
        };

        try {
            setSubmitting(true);

            const idempotencyKey = await getIdempotencyKey(payload);

            const response = await api.post("/orders", payload, {
                headers: {
                    "Idempotency-Key": idempotencyKey
                }
            });

            const order = response.data?.order;

            if (!response.data?.success || !order?.orderReference) {
                throw new Error(
                    response.data?.message ||
                    "The server returned an unexpected order response."
                );
            }

            const confirmationData = {
                orderReference: order.orderReference,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt || new Date().toISOString(),
                customer: payload.customer,
                deliveryAddress: payload.deliveryAddress,
                items: latestCart.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    sizeLabel: item.sizeLabel,
                    quantity: Number(item.quantity)
                }))
            };

            sessionStorage.setItem(
                "pickle_order_confirmation",
                JSON.stringify(confirmationData)
            );

            sessionStorage.removeItem("pickle_checkout_attempt");

            saveCart([]);
            setCart([]);

            navigate(
                `/order-confirmation/${order.orderReference}`,
                { replace: true }
            );
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "We couldn't place your order. Please try again.";

            setSubmitError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none transition placeholder:text-[#AA9C8D] focus:border-[#8E2922]";

    const labelClass =
        "mb-2 block text-xs font-semibold text-[#65564C]";

    return (
        <>
            <Navbar />

            <main className="min-h-[70vh] bg-[#FAF5EB] px-5 py-12 lg:px-10 lg:py-16">
                <div className="mx-auto max-w-6xl">
                    <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8E2922] hover:text-[#702019]"
                    >
                        <ArrowLeft size={15} />
                        Back to Cart
                    </Link>

                    <div className="mt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">
                            The final step
                        </p>

                        <h1 className="mt-3 font-serif text-4xl text-[#33251F] md:text-5xl">
                            Checkout
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#65564C]">
                            Share your delivery details and review your
                            favourite Andhra flavours before placing your
                            order.
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="mt-10 bg-white px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]">
                                <ShoppingBag size={28} />
                            </div>

                            <h2 className="mt-5 font-serif text-3xl text-[#33251F]">
                                Your cart is empty
                            </h2>

                            <p className="mt-3 text-sm text-[#65564C]">
                                Add some delicious pickles to continue.
                            </p>

                            <Link
                                to="/shop"
                                className="mt-7 inline-flex items-center gap-2 bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white"
                            >
                                Explore Pickles
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_360px]"
                        >
                            <div className="space-y-7">
                                <section className="bg-white p-6 sm:p-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center bg-[#F3E9D8] text-[#8E2922]">
                                            <MapPin size={19} />
                                        </div>

                                        <div>
                                            <h2 className="font-serif text-2xl text-[#33251F]">
                                                Customer Details
                                            </h2>

                                            <p className="mt-1 text-xs text-[#827365]">
                                                How can we contact you?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                        <label className="sm:col-span-2">
                                            <span className={labelClass}>
                                                Full name *
                                            </span>

                                            <input
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={updateField}
                                                required
                                                maxLength={100}
                                                autoComplete="name"
                                                placeholder="Enter your full name"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                Mobile number *
                                            </span>

                                            <input
                                                name="mobile"
                                                value={form.mobile}
                                                onChange={updateField}
                                                required
                                                inputMode="numeric"
                                                maxLength={10}
                                                autoComplete="tel"
                                                placeholder="10-digit mobile number"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                Alternate mobile number
                                            </span>

                                            <input
                                                name="alternateMobile"
                                                value={form.alternateMobile}
                                                onChange={updateField}
                                                inputMode="numeric"
                                                maxLength={10}
                                                placeholder="Optional"
                                                className={inputClass}
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section className="bg-white p-6 sm:p-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center bg-[#F3E9D8] text-[#8E2922]">
                                            <MapPin size={19} />
                                        </div>

                                        <div>
                                            <h2 className="font-serif text-2xl text-[#33251F]">
                                                Delivery Address
                                            </h2>

                                            <p className="mt-1 text-xs text-[#827365]">
                                                Enter your complete delivery
                                                address.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                        <label>
                                            <span className={labelClass}>
                                                House / Flat *
                                            </span>

                                            <input
                                                name="houseOrFlat"
                                                value={form.houseOrFlat}
                                                onChange={updateField}
                                                required
                                                maxLength={150}
                                                autoComplete="address-line1"
                                                placeholder="House or flat number"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                Street *
                                            </span>

                                            <input
                                                name="street"
                                                value={form.street}
                                                onChange={updateField}
                                                required
                                                maxLength={150}
                                                autoComplete="address-line2"
                                                placeholder="Street or area"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                Village / City *
                                            </span>

                                            <input
                                                name="villageOrCity"
                                                value={form.villageOrCity}
                                                onChange={updateField}
                                                required
                                                maxLength={100}
                                                placeholder="Village or city"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                District *
                                            </span>

                                            <input
                                                name="district"
                                                value={form.district}
                                                onChange={updateField}
                                                required
                                                maxLength={100}
                                                placeholder="District"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                State *
                                            </span>

                                            <input
                                                name="state"
                                                value={form.state}
                                                onChange={updateField}
                                                required
                                                maxLength={100}
                                                autoComplete="address-level1"
                                                placeholder="State"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label>
                                            <span className={labelClass}>
                                                PIN code *
                                            </span>

                                            <input
                                                name="pinCode"
                                                value={form.pinCode}
                                                onChange={updateField}
                                                required
                                                inputMode="numeric"
                                                maxLength={6}
                                                autoComplete="postal-code"
                                                placeholder="6-digit PIN code"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label className="sm:col-span-2">
                                            <span className={labelClass}>
                                                Landmark
                                            </span>

                                            <input
                                                name="landmark"
                                                value={form.landmark}
                                                onChange={updateField}
                                                maxLength={150}
                                                placeholder="Nearby landmark (optional)"
                                                className={inputClass}
                                            />
                                        </label>

                                        <label className="sm:col-span-2">
                                            <span className={labelClass}>
                                                Delivery instructions
                                            </span>

                                            <textarea
                                                name="deliveryInstructions"
                                                value={form.deliveryInstructions}
                                                onChange={updateField}
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Any additional delivery instructions (optional)"
                                                className={`${inputClass} resize-y`}
                                            />
                                        </label>
                                    </div>
                                </section>

                                {submitError && (
                                    <p
                                        role="alert"
                                        className="border border-[#D9A7A0] bg-[#FCEDEA] px-4 py-3 text-sm text-[#8E2922]"
                                    >
                                        {submitError}
                                    </p>
                                )}

                                <div className="flex items-start gap-3 border border-[#E5D8C6] bg-[#F3E9D8] p-4">
                                    <ShieldCheck
                                        className="mt-0.5 shrink-0 text-[#8E2922]"
                                        size={18}
                                    />

                                    <p className="text-xs leading-6 text-[#65564C]">
                                        **Order Confirmation & Payment**

After you place your order, our store owner will contact you on your registered mobile number to confirm your order and delivery details. Payment instructions will be shared during the call. Your order will be confirmed once the payment is completed and verified.
                                    </p>
                                </div>
                            </div>

                            <aside className="bg-[#F3E9D8] p-6 sm:p-7 lg:sticky lg:top-24">
                                <div className="flex items-center gap-3">
                                    <PackageCheck
                                        size={21}
                                        className="text-[#8E2922]"
                                    />

                                    <h2 className="font-serif text-2xl text-[#33251F]">
                                        Order Summary
                                    </h2>
                                </div>

                                <p className="mt-2 text-xs text-[#827365]">
                                    {itemCount}{" "}
                                    {itemCount === 1 ? "item" : "items"} in
                                    your order
                                </p>

                                <div className="mt-6 space-y-4 border-b border-[#D9C9B5] pb-5">
                                    {cart.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex justify-between gap-3 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-[#33251F]">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-xs text-[#827365]">
                                                    {item.sizeLabel || item.weight}{" "}
                                                    × {item.quantity}
                                                </p>
                                            </div>

                                            <span className="shrink-0 font-semibold text-[#33251F]">
                                                {formatPrice(
                                                    (Number(item.unitPrice) || 0) *
                                                        item.quantity
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 flex justify-between text-sm text-[#65564C]">
                                    <span>Estimated subtotal</span>

                                    <strong className="text-[#33251F]">
                                        {formatPrice(subtotal)}
                                    </strong>
                                </div>

                                <div className="mt-3 flex justify-between text-sm text-[#65564C]">
                                    <span>Shipping</span>

                                    <span className="text-right text-xs text-[#827365]">
                                        To be confirmed
                                    </span>
                                </div>

                                <div className="mt-5 border-t border-[#D9C9B5] pt-5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[#33251F]">
                                            Estimated total
                                        </span>

                                        <strong className="font-serif text-2xl text-[#8E2922]">
                                            {formatPrice(subtotal)}
                                        </strong>
                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-[#827365]">
                                        Final product total is calculated by
                                        the server. Shipping is not included.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || hasInvalidCartItem}
                                    className="mt-7 flex w-full items-center justify-center gap-2 bg-[#8E2922] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#702019] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Placing Order..."
                                        : "Place Order"}

                                    {!submitting && <ArrowRight size={16} />}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#827365]">
                                    <Truck size={14} />
                                    Delivery details included with your order
                                </div>
                            </aside>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Checkout;
