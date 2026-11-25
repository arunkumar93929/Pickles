
import api from "./api";

export const getCsrfToken = async () => {
  const response = await api.get("/admin/csrf-token");
  return response.data.csrfToken;
};

export const adminLogin = async (credentials) => {
  const csrfToken = await getCsrfToken();

  const response = await api.post("/admin/login", credentials, {
    headers: {
      "X-CSRF-Token": csrfToken
    }
  });

  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get("/admin/profile");
  return response.data.admin;
};

export const adminLogout = async () => {
  const csrfToken = await getCsrfToken();

  const response = await api.post(
    "/admin/logout",
    {},
    {
      headers: {
        "X-CSRF-Token": csrfToken
      }
    }
  );

  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data.dashboard;
};

export const getAdminOrders = async (page = 1, limit = 10) => {
  const response = await api.get("/admin/orders", {
    params: { page, limit }
  });

  return response.data;
};

export const getAdminOrderById = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data.order;
};
