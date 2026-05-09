import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
// Auth
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const logout = () => api.post('/logout');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Categories
export const getCategories = () => api.get('/categories');

// Brands
export const getBrands = () => api.get('/brands');

// Reviews
export const getProductReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const createReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);

// Orders
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);

// Addresses
export const getAddresses = () => api.get('/addresses');
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);

// Coupons
export const applyCoupon = (code) => api.post('/coupons/apply', { code });
