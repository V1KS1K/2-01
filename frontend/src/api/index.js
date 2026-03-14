import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

export const api = {
    getProducts: () => apiClient.get("/products").then(res => res.data),
    createProduct: (p) => apiClient.post("/products", p).then(res => res.data),
    updateProduct: (id, p) => apiClient.patch(`/products/${id}`, p).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`)
};