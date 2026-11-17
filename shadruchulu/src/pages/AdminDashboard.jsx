import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight, ArrowUpRight, Box, ClipboardList, Clock3, IndianRupee,
  LayoutDashboard, PackageCheck, Search, ShoppingBag, Truck, Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import products from "../data/products";
import { getOrders, updateOrderStatus } from "../utils/orders";

const STATUSES = ["Pending", "Confirmed", "Preparing", "Shipped", "Delivered", "Cancelled"];
const formatPrice = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(Number(amount) || 0);
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium", timeStyle: "short",
  }).format(date);
};
const normalizedStatus = (status) => {
  if (!status || status === "Demo order placed") return "Pending";
  return STATUSES.includes(status) ? status : "Pending";
};
const statusStyles = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  Preparing: "bg-violet-50 text-violet-800 border-violet-200",
  Shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  Delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

function AdminDashboard() {
  const [orders, setOrders] = useState(() => getOrders());
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const refresh = () => {
      const latest = getOrders();
      setOrders(latest);
      setSelectedOrder((current) => current ? latest.find((order) => order.orderId === current.orderId) || null : null);
    };
    window.addEventListener("shadruchulu-orders-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("shadruchulu-orders-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((order) => normalizedStatus(order.status) !== "Cancelled");
    const orderValue = activeOrders.reduce((sum, order) => sum + (Number(order.subtotal) || 0), 0);
    const pending = orders.filter((order) => ["Pending", "Confirmed", "Preparing"].includes(normalizedStatus(order.status))).length;
    const delivered = orders.filter((order) => normalizedStatus(order.status) === "Delivered").length;
    const customers = new Set(orders.map((order) => order.customer?.phone).filter(Boolean)).size;
    return { orderValue, pending, delivered, customers };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const status = normalizedStatus(order.status);
      const matchesStatus = statusFilter === "All statuses" || status === statusFilter;
      const matchesSearch = !query || [
        order.orderId, order.customer?.fullName, order.customer?.phone, order.customer?.city,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const changeStatus = (orderId, status) => {
    updateOrderStatus(orderId, status);
    setOrders(getOrders());
    setSelectedOrder((current) => current?.orderId === orderId ? { ...current, status } : current);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "products", label: "Products", icon: Box },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F7F2E9] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8E2922]">Shadruchulu · Store management</p>
              <h1 className="mt-2 font-serif text-4xl text-[#33251F] sm:text-5xl">Admin Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#827365]">A quick view of demo orders and the current pickle catalogue.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/shop" className="inline-flex items-center gap-2 border border-[#D9C9B5] bg-white px-4 py-3 text-xs font-semibold text-[#65564C] transition hover:border-[#8E2922] hover:text-[#8E2922]"><ShoppingBag size={15} /> View storefront</Link>
              <button type="button" onClick={() => { setOrders(getOrders()); setSearch(""); setStatusFilter("All statuses"); }} className="inline-flex items-center gap-2 bg-[#8E2922] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#702019]"><ArrowUpRight size={15} /> Refresh data</button>
            </div>
          </div>

          <div className="mt-7 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            <strong>Demo dashboard:</strong> Orders are read from this browser's local storage only. This is not connected to a live database, and the page has no admin login or access protection yet. Do not use it for real customer data.
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto border-b border-[#DFD2C1] pb-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setActiveTab(id); setSelectedOrder(null); }} className={`inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "bg-[#8E2922] text-white" : "bg-white text-[#65564C] hover:text-[#8E2922]"}`}><Icon size={16} /> {label}</button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total orders" value={orders.length} note="Orders saved in this browser" icon={ClipboardList} />
                <MetricCard label="Demo order value" value={formatPrice(metrics.orderValue)} note="Excludes cancelled orders" icon={IndianRupee} />
                <MetricCard label="Needs attention" value={metrics.pending} note="Pending, confirmed or preparing" icon={Clock3} />
                <MetricCard label="Delivered" value={metrics.delivered} note={`${metrics.customers} unique phone numbers`} icon={Truck} />
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="border border-[#E5D8C6] bg-white p-5 sm:p-7">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8E2922]">Latest activity</p><h2 className="mt-2 font-serif text-2xl text-[#33251F]">Recent orders</h2></div><button type="button" onClick={() => setActiveTab("orders")} className="text-xs font-semibold text-[#8E2922] hover:underline">View all</button></div>
                  {orders.length === 0 ? <EmptyOrders /> : <div className="mt-5 divide-y divide-[#EEE4D7]">{orders.slice(0, 5).map((order) => <OrderRow key={order.orderId} order={order} onOpen={() => { setSelectedOrder(order); setActiveTab("orders"); }} />)}</div>}
                </div>
                <div className="border border-[#E5D8C6] bg-[#F0E5D5] p-5 sm:p-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8E2922]">Store catalogue</p><h2 className="mt-2 font-serif text-2xl text-[#33251F]">Your products</h2>
                  <div className="mt-6 grid grid-cols-2 gap-3"><div className="bg-white p-4"><p className="text-3xl font-serif text-[#8E2922]">{products.length}</p><p className="mt-1 text-xs text-[#827365]">Total products</p></div><div className="bg-white p-4"><p className="text-3xl font-serif text-[#8E2922]">{products.filter((product) => product.category === "veg").length}</p><p className="mt-1 text-xs text-[#827365]">Vegetarian</p></div><div className="col-span-2 bg-white p-4"><p className="text-3xl font-serif text-[#8E2922]">{products.filter((product) => product.category === "non-veg").length}</p><p className="mt-1 text-xs text-[#827365]">Non-vegetarian</p></div></div>
                  <button type="button" onClick={() => setActiveTab("products")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8E2922]">View product catalogue <ArrowUpRight size={15} /></button>
                </div>
              </section>
            </>
          )}

          {activeTab === "orders" && (
            <section className="mt-7">
              {selectedOrder ? (
                <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} onStatusChange={changeStatus} />
              ) : (
                <div className="border border-[#E5D8C6] bg-white p-5 sm:p-7">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8E2922]">Order management</p><h2 className="mt-2 font-serif text-2xl text-[#33251F]">All orders <span className="text-lg text-[#A99885]">({filteredOrders.length})</span></h2></div><div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px]"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A99885]"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, phone" className="w-full border border-[#D9C9B5] bg-[#FFFEFC] py-3 pl-9 pr-3 text-xs outline-none focus:border-[#8E2922]"/></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-[#D9C9B5] bg-[#FFFEFC] px-3 py-3 text-xs outline-none focus:border-[#8E2922]"><option>All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div></div>
                  {filteredOrders.length === 0 ? <EmptyOrders /> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-y border-[#EEE4D7] text-[10px] uppercase tracking-wider text-[#827365]"><th className="py-3 pr-4 font-semibold">Order</th><th className="py-3 pr-4 font-semibold">Customer</th><th className="py-3 pr-4 font-semibold">Date</th><th className="py-3 pr-4 font-semibold">Amount</th><th className="py-3 pr-4 font-semibold">Status</th><th className="py-3 font-semibold">Action</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.orderId} className="border-b border-[#F0E8DE] text-xs text-[#65564C]"><td className="py-4 pr-4 font-semibold text-[#33251F]">{order.orderId}</td><td className="py-4 pr-4"><span className="block font-semibold text-[#33251F]">{order.customer?.fullName || "Customer"}</span><span className="mt-1 block text-[11px] text-[#827365]">{order.customer?.phone || "No phone"}</span></td><td className="py-4 pr-4">{formatDate(order.createdAt)}</td><td className="py-4 pr-4 font-semibold text-[#8E2922]">{formatPrice(order.subtotal)}</td><td className="py-4 pr-4"><StatusPill status={normalizedStatus(order.status)} /></td><td className="py-4"><button type="button" onClick={() => setSelectedOrder(order)} className="font-semibold text-[#8E2922] hover:underline">View details</button></td></tr>)}</tbody></table></div>}
                </div>
              )}
            </section>
          )}

          {activeTab === "products" && (
            <section className="mt-7 border border-[#E5D8C6] bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8E2922]">Product management · preview</p><h2 className="mt-2 font-serif text-2xl text-[#33251F]">Product catalogue</h2><p className="mt-2 text-xs text-[#827365]">Current sample products and pack prices. Editing prices and stock will be connected in a later phase.</p></div><span className="bg-[#F3E9D8] px-3 py-2 text-[11px] font-semibold text-[#65564C]">{products.length} products</span></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="flex gap-4 border border-[#EEE4D7] p-4"><div className="grid h-14 w-14 shrink-0 place-items-center bg-[#F3E9D8] text-[#8E2922]"><PackageCheck size={22}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-serif text-lg text-[#33251F]">{product.name}</h3><span className="text-[9px] font-semibold uppercase tracking-wider text-[#8E2922]">{product.category === "veg" ? "Veg" : "Non-veg"}</span></div><p className="mt-2 text-xs text-[#827365]">250g {formatPrice(product.prices?.["250 g"])} · 500g {formatPrice(product.prices?.["500 g"])} · 1kg {formatPrice(product.prices?.["1 kg"])}</p></div></article>)}</div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function MetricCard({ label, value, note, icon: Icon }) {
  return <article className="border border-[#E5D8C6] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#827365]">{label}</span><span className="grid h-9 w-9 place-items-center bg-[#F3E9D8] text-[#8E2922]"><Icon size={17}/></span></div><p className="mt-4 font-serif text-3xl text-[#33251F]">{value}</p><p className="mt-2 text-[11px] text-[#A09180]">{note}</p></article>;
}

function StatusPill({ status }) {
  return <span className={`inline-flex border px-2.5 py-1 text-[10px] font-semibold ${statusStyles[status] || statusStyles.Pending}`}>{status}</span>;
}

function OrderRow({ order, onOpen }) {
  return <button type="button" onClick={onOpen} className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left transition hover:bg-[#FFFCF7]"><div><p className="text-xs font-semibold text-[#33251F]">{order.orderId}</p><p className="mt-1 text-[11px] text-[#827365]">{order.customer?.fullName || "Customer"} · {formatDate(order.createdAt)}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-xs font-semibold text-[#8E2922]">{formatPrice(order.subtotal)}</p><div className="mt-1"><StatusPill status={normalizedStatus(order.status)}/></div></div><ArrowUpRight size={15} className="text-[#A99885]"/></div></button>;
}

function EmptyOrders() {
  return <div className="py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center bg-[#F3E9D8] text-[#8E2922]"><ClipboardList size={23}/></div><h3 className="mt-4 font-serif text-xl text-[#33251F]">No orders to show yet</h3><p className="mt-2 text-xs leading-6 text-[#827365]">Place a demo order through the storefront and it will appear here in this browser.</p></div>;
}

function OrderDetail({ order, onBack, onStatusChange }) {
  const status = normalizedStatus(order.status);
  return <div className="border border-[#E5D8C6] bg-white p-5 sm:p-7"><button type="button" onClick={onBack} className="text-xs font-semibold text-[#8E2922] hover:underline">← Back to all orders</button><div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#EEE4D7] pb-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E2922]">Order details</p><h2 className="mt-2 font-serif text-2xl text-[#33251F]">{order.orderId}</h2><p className="mt-1 text-xs text-[#827365]">{formatDate(order.createdAt)}</p></div><div className="min-w-[190px]"><label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#827365]">Update order status</label><select value={status} onChange={(event) => onStatusChange(order.orderId, event.target.value)} className="w-full border border-[#D9C9B5] bg-[#FFFEFC] px-3 py-3 text-xs font-semibold text-[#33251F] outline-none focus:border-[#8E2922]">{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="mt-6 grid gap-6 md:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase tracking-wider text-[#8E2922]">Customer</h3><p className="mt-3 text-sm font-semibold text-[#33251F]">{order.customer?.fullName || "Customer"}</p><p className="mt-1 text-xs leading-6 text-[#65564C]">{order.customer?.phone || "Phone unavailable"}<br/>{order.customer?.email || "Email not provided"}</p><h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#8E2922]">Delivery address</h3><p className="mt-3 text-xs leading-6 text-[#65564C]">{order.customer?.address}<br/>{order.customer?.landmark ? `${order.customer.landmark}, ` : ""}{[order.customer?.city, order.customer?.state, order.customer?.pincode].filter(Boolean).join(", ")}</p>{order.customer?.notes && <p className="mt-3 text-xs leading-5 text-[#827365]">Instructions: {order.customer.notes}</p>}</div><div><h3 className="text-xs font-semibold uppercase tracking-wider text-[#8E2922]">Items ordered</h3><div className="mt-3 divide-y divide-[#EEE4D7]">{(order.items || []).map((item, index) => <div key={item.key || `${item.productId}-${index}`} className="flex justify-between gap-3 py-3 text-xs"><div><p className="font-semibold text-[#33251F]">{item.name}</p><p className="mt-1 text-[#827365]">{item.weight} × {item.quantity}</p></div><p className="font-semibold text-[#8E2922]">{formatPrice((Number(item.unitPrice) || 0) * (Number(item.quantity) || 0))}</p></div>)}</div><div className="mt-4 flex justify-between border-t border-[#D9C9B5] pt-4 text-sm"><span className="font-semibold text-[#33251F]">Order total</span><strong className="font-serif text-xl text-[#8E2922]">{formatPrice(order.subtotal)}</strong></div><p className="mt-3 text-xs text-[#827365]">Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "UPI (demo)"}</p></div></div></div>;
}

export default AdminDashboard;
