import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, PackageCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrders } from "../utils/orders";

const formatPrice = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(amount || 0);

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function MyOrders() {
  const [orders, setOrders] = useState(() => getOrders());

  useEffect(() => {
    const refresh = () => setOrders(getOrders());
    window.addEventListener("shadruchulu-orders-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("shadruchulu-orders-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-[65vh] bg-[#FAF5EB] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">Your Shadruchulu account</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-[#33251F] md:text-5xl">My Orders</h1>
              <p className="mt-3 text-sm text-[#827365]">A record of the orders placed from this browser.</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8E2922] hover:text-[#702019]">Shop pickles <ArrowRight size={16} /></Link>
          </div>

          {orders.length === 0 ? (
            <section className="mt-10 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]"><ClipboardList size={28} /></div>
              <h2 className="mt-6 font-serif text-3xl text-[#33251F]">No orders yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#65564C]">Your placed demo orders will appear here. Explore our pickles and place your first order to see the order journey.</p>
              <Link to="/shop" className="mt-7 inline-flex items-center gap-2 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]">Explore Pickles <ArrowRight size={16} /></Link>
            </section>
          ) : (
            <div className="mt-9 space-y-5">
              {orders.map((order) => {
                const count = (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                return (
                  <article key={order.orderId} className="border border-[#E5D8C6] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEE4D7] pb-5">
                      <div>
                        <div className="flex items-center gap-2 text-[#8E2922]"><PackageCheck size={18} /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Order placed</span></div>
                        <h2 className="mt-2 font-serif text-xl text-[#33251F]">{order.orderId}</h2>
                        <p className="mt-1 text-xs text-[#827365]">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-serif text-2xl text-[#8E2922]">{formatPrice(order.subtotal)}</p>
                        <span className="mt-2 inline-flex bg-[#F3E9D8] px-3 py-1 text-[11px] font-semibold text-[#65564C]">{order.status || "Demo order placed"}</span>
                      </div>
                    </div>
                    <div className="grid gap-4 py-5 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#827365]">Items</p>
                        <p className="mt-2 text-sm leading-6 text-[#33251F]">{(order.items || []).map((item) => `${item.name} · ${item.weight} × ${item.quantity}`).join(", ") || "Order items unavailable"}</p>
                        <p className="mt-2 text-xs text-[#827365]">{count} {count === 1 ? "item" : "items"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#827365]">Delivering to</p>
                        <p className="mt-2 text-sm leading-6 text-[#33251F]">{order.customer?.fullName || "Customer"}<br />{order.customer?.address}{order.customer?.landmark ? `, ${order.customer.landmark}` : ""}<br />{[order.customer?.city, order.customer?.state, order.customer?.pincode].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE4D7] pt-4">
                      <p className="text-xs text-[#827365]">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI (demo)"}</p>
                      <Link to={`/order-confirmation/${order.orderId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8E2922] hover:text-[#702019]">View order details <ArrowRight size={15} /></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="mt-7 text-xs leading-6 text-[#827365]">Demo mode: order history is stored only in this browser. It is not synced to a customer account or the Shadruchulu team.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default MyOrders;
