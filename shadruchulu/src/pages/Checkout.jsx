import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import products from "../data/products";
import { getCart, saveCart } from "../utils/cart";
import { saveOrder } from "../utils/orders";

const formatPrice = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(amount);

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  landmark: "",
  city: "",
  state: "Andhra Pradesh",
  pincode: "",
  notes: "",
  paymentMethod: "cod",
};

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => getCart());
  const [form, setForm] = useState(initialForm);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const refreshCart = () => setCart(getCart());
    window.addEventListener("shadruchulu-cart-updated", refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      window.removeEventListener("shadruchulu-cart-updated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = useMemo(() => cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const unitPrice = item.unitPrice ?? product?.prices?.[item.weight] ?? 0;
    return total + unitPrice * item.quantity;
  }, 0), [cart]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError("");

    const latestCart = getCart();
    if (latestCart.length === 0) {
      setCart([]);
      setSubmitError("Your cart is empty. Add some pickles before checking out.");
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, "");
    const pinDigits = form.pincode.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (pinDigits.length !== 6) {
      setSubmitError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const orderSubtotal = latestCart.reduce((total, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const unitPrice = item.unitPrice ?? product?.prices?.[item.weight] ?? 0;
      return total + unitPrice * item.quantity;
    }, 0);

    const order = {
      orderId: `SH${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: form.fullName.trim(),
        phone: phoneDigits,
        email: form.email.trim(),
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: pinDigits,
        notes: form.notes.trim(),
      },
      items: latestCart,
      subtotal: orderSubtotal,
      paymentMethod: form.paymentMethod,
      status: "Demo order placed",
    };

    try {
      saveOrder(order);
      saveCart([]);
      setCart([]);
      setCompletedOrder(order);
      navigate(`/order-confirmation/${order.orderId}`, { replace: true });
    } catch {
      setSubmitError("We couldn't save this demo order in your browser. Please check your browser storage and try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-[#FAF5EB] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-6xl">
          {completedOrder ? (
            <section className="mx-auto max-w-2xl bg-white px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF1E6] text-[#496B3D]"><CheckCircle2 size={34} /></div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">Thank you for choosing us</p>
              <h1 className="mt-3 font-serif text-4xl text-[#33251F] sm:text-5xl">Your demo order is placed!</h1>
              <p className="mt-4 text-sm leading-7 text-[#65564C]">This is a website preview. Your order has been saved in this browser only; no real order has been sent to the Shadruchulu team and no payment has been collected.</p>
              <div className="mt-8 border-y border-[#E5D8C6] py-5 text-left">
                <div className="flex justify-between gap-4 text-sm"><span className="text-[#827365]">Demo order number</span><strong className="text-[#33251F]">{completedOrder.orderId}</strong></div>
                <div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-[#827365]">Items</span><strong className="text-[#33251F]">{completedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
                <div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-[#827365]">Subtotal</span><strong className="text-[#8E2922]">{formatPrice(completedOrder.subtotal)}</strong></div>
                <div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-[#827365]">Payment choice</span><strong className="text-[#33251F]">{completedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "UPI (manual demo)"}</strong></div>
              </div>
              <Link to="/shop" className="mt-8 inline-flex items-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]">Continue Shopping <ArrowRight size={16} /></Link>
            </section>
          ) : (
            <>
              <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8E2922] hover:text-[#702019]"><ArrowLeft size={15} /> Back to Cart</Link>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">The final step</p>
                <h1 className="mt-3 font-serif text-4xl text-[#33251F] md:text-5xl">Checkout</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#65564C]">Share your delivery details and review your favourite Andhra flavours before placing your demo order.</p>
              </div>

              {cart.length === 0 ? (
                <div className="mt-10 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]"><ShoppingBag size={28} /></div>
                  <h2 className="mt-5 font-serif text-3xl text-[#33251F]">Your cart is empty</h2>
                  <p className="mt-3 text-sm text-[#65564C]">Add some delicious pickles to continue to checkout.</p>
                  <Link to="/shop" className="mt-7 inline-flex items-center gap-2 bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white">Explore Pickles <ArrowRight size={16} /></Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-7">
                    <section className="bg-white p-6 sm:p-8">
                      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center bg-[#F3E9D8] text-[#8E2922]"><MapPin size={19} /></div><div><h2 className="font-serif text-2xl text-[#33251F]">Delivery Details</h2><p className="mt-1 text-xs text-[#827365]">Where should we deliver your order?</p></div></div>
                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#65564C]">Full name *</span><input name="fullName" value={form.fullName} onChange={updateField} required autoComplete="name" placeholder="Enter your full name" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none transition placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">Mobile number *</span><input name="phone" value={form.phone} onChange={updateField} required inputMode="numeric" pattern="[0-9+() -]{10,16}" autoComplete="tel" placeholder="10-digit mobile number" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">Email address</span><input type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="you@example.com (optional)" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#65564C]">House / Flat / Street address *</span><textarea name="address" value={form.address} onChange={updateField} required rows={3} autoComplete="street-address" placeholder="House number, street, area" className="w-full resize-y border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">Landmark</span><input name="landmark" value={form.landmark} onChange={updateField} placeholder="Nearby landmark (optional)" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">City / Town *</span><input name="city" value={form.city} onChange={updateField} required autoComplete="address-level2" placeholder="Your city" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">State *</span><input name="state" value={form.state} onChange={updateField} required autoComplete="address-level1" placeholder="State" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label><span className="mb-2 block text-xs font-semibold text-[#65564C]">PIN code *</span><input name="pincode" value={form.pincode} onChange={updateField} required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" placeholder="6-digit PIN code" className="w-full border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                        <label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#65564C]">Delivery note</span><textarea name="notes" value={form.notes} onChange={updateField} rows={2} placeholder="Any instructions for delivery? (optional)" className="w-full resize-y border border-[#DCCFBE] bg-[#FFFEFC] px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#AA9C8D] focus:border-[#8E2922]" /></label>
                      </div>
                    </section>

                    <section className="bg-white p-6 sm:p-8">
                      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center bg-[#F3E9D8] text-[#8E2922]"><ShieldCheck size={19} /></div><div><h2 className="font-serif text-2xl text-[#33251F]">Payment Method</h2><p className="mt-1 text-xs text-[#827365]">Choose how you would prefer to pay</p></div></div>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <label className={`flex cursor-pointer items-start gap-3 border p-4 transition ${form.paymentMethod === "cod" ? "border-[#8E2922] bg-[#FBF5ED]" : "border-[#E5D8C6] hover:border-[#C7AE96]"}`}><input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === "cod"} onChange={updateField} className="mt-1 accent-[#8E2922]" /><span><strong className="block text-sm text-[#33251F]">Cash on Delivery</strong><span className="mt-1 block text-xs leading-5 text-[#827365]">Pay when your parcel arrives.</span></span></label>
                        <label className={`flex cursor-pointer items-start gap-3 border p-4 transition ${form.paymentMethod === "upi" ? "border-[#8E2922] bg-[#FBF5ED]" : "border-[#E5D8C6] hover:border-[#C7AE96]"}`}><input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === "upi"} onChange={updateField} className="mt-1 accent-[#8E2922]" /><span><strong className="block text-sm text-[#33251F]">UPI</strong><span className="mt-1 block text-xs leading-5 text-[#827365]">Manual payment option for demo only; no payment is collected.</span></span></label>
                      </div>
                    </section>
                    {submitError && <p role="alert" className="border border-[#D9A7A0] bg-[#FCEDEA] px-4 py-3 text-sm text-[#8E2922]">{submitError}</p>}
                    <div className="flex items-start gap-3 border border-[#E5D8C6] bg-[#F3E9D8] p-4"><ShieldCheck className="mt-0.5 shrink-0 text-[#8E2922]" size={18} /><p className="text-xs leading-6 text-[#65564C]">Demo checkout only: this preview stores the order in your browser. It does not send customer details to a server, notify the brand, arrange delivery or process payment.</p></div>
                  </div>

                  <aside className="bg-[#F3E9D8] p-6 sm:p-7 lg:sticky lg:top-24">
                    <div className="flex items-center gap-3"><PackageCheck size={21} className="text-[#8E2922]" /><h2 className="font-serif text-2xl text-[#33251F]">Order Summary</h2></div>
                    <p className="mt-2 text-xs text-[#827365]">{itemCount} {itemCount === 1 ? "item" : "items"} in your order</p>
                    <div className="mt-6 space-y-4 border-b border-[#D9C9B5] pb-5">
                      {cart.map((item) => {
                        const product = products.find((entry) => entry.id === item.productId);
                        const unitPrice = item.unitPrice ?? product?.prices?.[item.weight] ?? 0;
                        return <div key={item.key} className="flex justify-between gap-3 text-sm"><div className="min-w-0"><p className="font-medium text-[#33251F]">{item.name}</p><p className="mt-1 text-xs text-[#827365]">{item.weight} × {item.quantity}</p></div><span className="shrink-0 font-semibold text-[#33251F]">{formatPrice(unitPrice * item.quantity)}</span></div>;
                      })}
                    </div>
                    <div className="mt-5 flex justify-between text-sm text-[#65564C]"><span>Subtotal</span><strong className="text-[#33251F]">{formatPrice(subtotal)}</strong></div>
                    <div className="mt-3 flex justify-between text-sm text-[#65564C]"><span>Shipping</span><span className="text-right text-xs text-[#827365]">To be confirmed</span></div>
                    <div className="mt-5 border-t border-[#D9C9B5] pt-5"><div className="flex items-center justify-between"><span className="font-semibold text-[#33251F]">Estimated total</span><strong className="font-serif text-2xl text-[#8E2922]">{formatPrice(subtotal)}</strong></div><p className="mt-2 text-xs leading-5 text-[#827365]">Sample prices only. Shipping is not included.</p></div>
                    <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 bg-[#8E2922] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]">Place Demo Order <ArrowRight size={16} /></button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#827365]"><Truck size={14} /> Delivery details saved with your demo order</div>
                  </aside>
                </form>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Checkout;
