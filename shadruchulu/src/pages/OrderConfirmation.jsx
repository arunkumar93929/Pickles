import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrderById } from "../utils/orders";

const formatPrice = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(amount || 0);

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function OrderConfirmation() {
  const { orderId } = useParams();
  const order = getOrderById(orderId);

  return (
    <>
      <Navbar />
      <main className="min-h-[65vh] bg-[#FAF5EB] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl">
          {!order ? (
            <section className="bg-white px-6 py-14 text-center shadow-sm sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]"><PackageCheck size={28} /></div>
              <h1 className="mt-6 font-serif text-3xl text-[#33251F]">Order not found</h1>
              <p className="mt-3 text-sm leading-7 text-[#65564C]">This order may have been placed in a different browser or its local browser data may have been cleared.</p>
              <Link to="/orders" className="mt-7 inline-flex items-center gap-2 bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white">Go to My Orders <ArrowRight size={16} /></Link>
            </section>
          ) : (
            <>
              <section className="bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF1E6] text-[#496B3D]"><CheckCircle2 size={34} /></div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">Thank you for choosing us</p>
                <h1 className="mt-3 font-serif text-4xl text-[#33251F] sm:text-5xl">Your order is placed!</h1>
                <p className="mt-4 text-sm leading-7 text-[#65564C]">Your demo order has been saved in this browser. No real order has been sent and no payment has been collected.</p>
                <div className="mt-8 inline-flex flex-col items-center border-y border-[#E5D8C6] px-8 py-4">
                  <span className="text-xs text-[#827365]">Demo order number</span>
                  <strong className="mt-1 text-lg tracking-wider text-[#8E2922]">{order.orderId}</strong>
                  <span className="mt-2 text-xs text-[#827365]">{formatDate(order.createdAt)}</span>
                </div>
              </section>

              <section className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
                <div className="bg-white p-6 sm:p-7">
                  <div className="flex items-center gap-3"><PackageCheck className="text-[#8E2922]" size={20} /><h2 className="font-serif text-2xl text-[#33251F]">Order items</h2></div>
                  <div className="mt-5 divide-y divide-[#EEE4D7]">
                    {(order.items || []).map((item) => (
                      <div key={item.key || `${item.productId}-${item.weight}`} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <div><p className="text-sm font-semibold text-[#33251F]">{item.name}</p><p className="mt-1 text-xs text-[#827365]">{item.weight} × {item.quantity}</p></div>
                        <strong className="shrink-0 text-sm text-[#33251F]">{formatPrice((item.unitPrice || 0) * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between border-t border-[#E5D8C6] pt-5 text-sm"><span className="font-semibold text-[#33251F]">Subtotal</span><strong className="text-[#8E2922]">{formatPrice(order.subtotal)}</strong></div>
                </div>

                <aside className="bg-[#F3E9D8] p-6 sm:p-7">
                  <div className="flex items-center gap-2"><MapPin size={18} className="text-[#8E2922]" /><h2 className="font-serif text-xl text-[#33251F]">Delivery details</h2></div>
                  <p className="mt-4 text-sm font-semibold text-[#33251F]">{order.customer?.fullName}</p>
                  <p className="mt-2 text-sm leading-6 text-[#65564C]">{order.customer?.phone}<br />{order.customer?.address}{order.customer?.landmark ? `, ${order.customer.landmark}` : ""}<br />{[order.customer?.city, order.customer?.state, order.customer?.pincode].filter(Boolean).join(", ")}</p>
                  <div className="mt-5 border-t border-[#D9C9B5] pt-4"><p className="text-xs text-[#827365]">Payment method</p><p className="mt-1 text-sm font-semibold text-[#33251F]">{order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI (manual demo)"}</p></div>
                </aside>
              </section>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/orders" className="inline-flex items-center gap-2 border border-[#8E2922] px-6 py-3 text-sm font-semibold text-[#8E2922] hover:bg-[#F3E9D8]">View My Orders</Link>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#702019]">Continue Shopping <ArrowRight size={16} /></Link>
              </div>
            </>
          )}
          <p className="mt-7 text-center text-xs leading-6 text-[#827365]">Demo mode only. Orders are stored locally in this browser and are not shared with the store.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default OrderConfirmation;
