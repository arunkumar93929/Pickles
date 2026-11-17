const ORDERS_KEY = "shadruchulu_orders";

export function getOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrderById(orderId) {
  return getOrders().find((order) => order.orderId === orderId) || null;
}

export function saveOrder(order) {
  const orders = getOrders();
  const updated = [order, ...orders.filter((item) => item.orderId !== order.orderId)];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("shadruchulu-orders-updated"));
  return updated;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const updated = orders.map((order) =>
    order.orderId === orderId
      ? { ...order, status, updatedAt: new Date().toISOString() }
      : order
  );
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("shadruchulu-orders-updated"));
  return updated;
}
