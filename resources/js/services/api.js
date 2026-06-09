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
export const getInventoryAlerts = () => api.get('/products/inventory-alerts');

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
export const getAdminOrders = () => api.get('/admin/orders');
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status });

// Addresses
export const getAddresses = () => api.get('/addresses');
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);

// Reports
export const getSalesReport = (period) => api.get('/reports/sales', { params: { period } });

// Shipments
export const getShipments = () => api.get('/shipments');
export const createShipment = (orderId, data) => api.post(`/orders/${orderId}/shipment`, data);
export const updateShipment = (shipmentId, data) => api.put(`/shipments/${shipmentId}`, data);
export const getOrderShipment = (orderId) => api.get(`/orders/${orderId}/shipment`);

// Returns
export const getReturns = () => api.get('/returns');
export const requestReturn = (orderId, data) => api.post(`/orders/${orderId}/return`, data);
export const updateReturn = (returnId, data) => api.patch(`/returns/${returnId}`, data);
export const getCoupons = () => api.get('/coupons');
export const applyCoupon = (code) => api.post('/coupons/apply', { code });

// Saved Cards
export const getSavedCards = () => api.get('/saved-cards');
export const deleteSavedCard = (id) => api.delete(`/saved-cards/${id}`);
