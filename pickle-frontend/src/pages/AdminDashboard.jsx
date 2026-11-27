
import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ClipboardList,
  IndianRupee,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  X
} from "lucide-react";

import {
  adminLogout,
  getAdminOrderById,
  getAdminOrders,
  getDashboardSummary
} from "../services/adminService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

function MetricCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl border border-[#E9DFD1] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="mt-3 text-2xl font-bold text-[#33251F]">
            {value}
          </h2>
          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className="rounded-lg bg-[#8E2922]/10 p-3">
          <Icon size={22} className="text-[#8E2922]" />
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ order, onClose }) {
  if (!order) return null;

  const address = order.deliveryAddress || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <div>
            <h2 className="text-xl font-bold text-[#33251F]">
              Order details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {order.orderReference}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close order details"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <h3 className="mb-3 font-semibold text-[#33251F]">
              Customer information
            </h3>

            <div className="grid gap-3 rounded-xl bg-[#F7F2E9] p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Customer name</p>
                <p className="mt-1 font-medium text-[#33251F]">
                  {order.customer?.fullName || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Mobile number</p>
                <p className="mt-1 font-medium text-[#33251F]">
                  {order.customer?.mobile || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Alternate mobile</p>
                <p className="mt-1 font-medium text-[#33251F]">
                  {order.customer?.alternateMobile || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Order date</p>
                <p className="mt-1 font-medium text-[#33251F]">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-[#33251F]">
              Delivery address
            </h3>

            <div className="rounded-xl bg-[#F7F2E9] p-4 text-sm leading-6 text-[#33251F]">
              <p>{address.houseOrFlat}</p>
              <p>{address.street}</p>
              <p>{address.villageOrCity}, {address.district}</p>
              <p>{address.state} - {address.pinCode}</p>

              {address.landmark && (
                <p className="mt-2">
                  <strong>Landmark:</strong> {address.landmark}
                </p>
              )}

              {address.deliveryInstructions && (
                <p className="mt-2">
                  <strong>Instructions:</strong>{" "}
                  {address.deliveryInstructions}
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-[#33251F]">
              Ordered products
            </h3>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-[#F7F2E9] text-[#33251F]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit price</th>
                    <th className="p-3">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {(order.items || []).map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className="border-t">
                      <td className="p-3 font-medium text-[#33251F]">
                        {item.productName}
                      </td>
                      <td className="p-3">{item.sizeLabel}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-3 font-medium">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="rounded-xl bg-[#F7F2E9] px-5 py-4 text-right">
                <p className="text-sm text-gray-500">Order total</p>
                <p className="mt-1 text-xl font-bold text-[#8E2922]">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const loadDashboard = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, ordersData] = await Promise.all([
        getDashboardSummary(),
        getAdminOrders(requestedPage, 10)
      ]);

      setDashboard(dashboardData);
      setOrders(ordersData.orders || []);
      setPagination(ordersData.pagination || null);
      setPage(requestedPage);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(1);
  }, []);

  const handleViewOrder = async (id) => {
    try {
      setDetailLoading(true);
      setSelectedOrder(null);

      const order = await getAdminOrderById(id);
      setSelectedOrder(order);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to load order details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await adminLogout();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to logout. Please try again."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F2E9]">
        <p className="font-medium text-[#33251F]">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2E9]">
      <header className="border-b border-[#E9DFD1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-[#8E2922] sm:text-2xl">
              Kumar Pickles Admin
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Store management dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
  <Link
    to="/admin/products"
    className="flex items-center gap-2 rounded-lg border border-[#8E2922] px-3 py-2 text-sm font-semibold text-[#8E2922] transition hover:bg-[#8E2922] hover:text-white"
  >
    <Box size={16} />
    <span>Products</span>
  </Link>

  <button
    onClick={() => loadDashboard(page)}
    disabled={loading}
    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#33251F] hover:bg-gray-50 disabled:opacity-50"
  >
    <RefreshCw size={16} />
    <span className="hidden sm:inline">Refresh</span>
  </button>

  <button
    onClick={handleLogout}
    disabled={logoutLoading}
    className="flex items-center gap-2 rounded-lg bg-[#8E2922] px-3 py-2 text-sm font-semibold text-white hover:bg-[#70201B] disabled:opacity-50"
  >
    <LogOut size={16} />
    {logoutLoading ? "Logging out..." : "Logout"}
  </button>
</div>

          
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-[#33251F]">
            Dashboard overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A summary of your store's orders and products.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Total orders"
            value={dashboard?.totalOrders ?? 0}
            icon={ClipboardList}
            description="All orders received"
          />

          <MetricCard
            title="Total order value"
            value={formatCurrency(dashboard?.totalOrderValue)}
            icon={IndianRupee}
            description="Combined value of all orders"
          />

          <MetricCard
            title="Products listed"
            value={dashboard?.totalProducts ?? 0}
            icon={Box}
            description="Products in your catalogue"
          />
        </section>

        <section className="mt-9">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#33251F]">
                Orders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View customer orders and delivery information.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600">
              {pagination?.totalOrders ?? 0} total
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E9DFD1] bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <ShoppingBag
                  size={36}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="font-semibold text-[#33251F]">
                  No orders yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Customer orders will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-[#F7F2E9] text-[#33251F]">
                      <tr>
                        <th className="px-5 py-4">Order reference</th>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Mobile</th>
                        <th className="px-5 py-4">Order date</th>
                        <th className="px-5 py-4">Total</th>
                        <th className="px-5 py-4">Details</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-t border-gray-100 hover:bg-[#FCFAF6]"
                        >
                          <td className="px-5 py-4 font-semibold text-[#8E2922]">
                            {order.orderReference}
                          </td>

                          <td className="px-5 py-4 text-[#33251F]">
                            {order.customer?.fullName || "—"}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {order.customer?.mobile || "—"}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="px-5 py-4 font-semibold text-[#33251F]">
                            {formatCurrency(order.totalAmount)}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleViewOrder(order._id)}
                              className="rounded-lg border border-[#8E2922] px-3 py-2 text-xs font-semibold text-[#8E2922] transition hover:bg-[#8E2922] hover:text-white"
                            >
                              View order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                  <p className="text-sm text-gray-500">
                    Page {pagination?.currentPage ?? page} of{" "}
                    {pagination?.totalPages ?? 1}
                  </p>

                  <div className="flex gap-2">
                    <button
                      disabled={!pagination?.hasPreviousPage || loading}
                      onClick={() => loadDashboard(page - 1)}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#33251F] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>

                    <button
                      disabled={!pagination?.hasNextPage || loading}
                      onClick={() => loadDashboard(page + 1)}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#33251F] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#33251F]">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              The latest orders received by your store.
            </p>
          </div>

          <div className="rounded-xl border border-[#E9DFD1] bg-white shadow-sm">
            {!dashboard?.recentOrders?.length ? (
              <p className="p-6 text-sm text-gray-500">
                No recent orders available.
              </p>
            ) : (
              dashboard.recentOrders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => handleViewOrder(order._id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 text-left last:border-b-0 hover:bg-[#FCFAF6]"
                >
                  <div>
                    <p className="font-semibold text-[#8E2922]">
                      {order.orderReference}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.customer?.fullName || "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <p className="font-semibold text-[#33251F]">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      {detailLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <p className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-[#33251F]">
            Loading order details...
          </p>
        </div>
      )}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
