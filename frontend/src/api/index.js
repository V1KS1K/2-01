import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const api = {
    // Auth
    register: (data) => apiClient.post("/auth/register", data),
    login: (data) => apiClient.post("/auth/login", data).then(res => {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        return res.data;
    }),
    getMe: () => apiClient.get("/auth/me").then(res => res.data),
    
    // Users (Admin Only)
    getUsers: () => apiClient.get("/users").then(res => res.data),
    updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
    deleteUser: (id) => apiClient.delete(`/users/${id}`),
    
    // Products
    getProducts: () => apiClient.get("/products").then(res => res.data),
    createProduct: (p) => apiClient.post("/products", p).then(res => res.data),
    updateProduct: (id, p) => apiClient.put(`/products/${id}`, p).then(res => res.data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`)
};