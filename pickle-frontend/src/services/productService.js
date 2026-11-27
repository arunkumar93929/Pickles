
import api from "./api";

export const getProducts = async () => {
    const response = await api.get("/products");

    if (!Array.isArray(response.data?.products)) {
        throw new Error("Invalid products response from server.");
    }

    return response.data.products;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);

    if (!response.data?.product) {
        throw new Error("Invalid product response from server.");
    }

    return response.data.product;
};
