
import api from "./api";
import { getCsrfToken } from "./adminService";

export const getAdminProducts = async () => {
  const response = await api.get("/products", {
    params: {
      page: 1,
      limit: 100
    }
  });
   console.log("Admin products API response:", response.data);
  console.log("Products array:", response.data.products);

  return response.data.products || [];
};

export const createAdminProduct = async (formData) => {
  const csrfToken = await getCsrfToken();

  const response = await api.post("/admin/products", formData, {
    headers: {
      "X-CSRF-Token": csrfToken
    }
  });

  return response.data;
};

export const updateAdminProduct = async (id, formData) => {
  const csrfToken = await getCsrfToken();

  const response = await api.put(`/admin/products/${id}`, formData, {
    headers: {
      "X-CSRF-Token": csrfToken
    }
  });

  return response.data;
};

export const deleteAdminProduct = async (id) => {
  const csrfToken = await getCsrfToken();

  const response = await api.delete(`/admin/products/${id}`, {
    headers: {
      "X-CSRF-Token": csrfToken
    }
  });

  return response.data;
};
