import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 180000, // 180 second timeout for file uploads (STEP conversion is slow)
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Response Error:', error);
        
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.error || error.response.data?.message || 'Server error';
            throw new Error(message);
        } else if (error.request) {
            // Request made but no response
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Error in request setup
            throw new Error(error.message || 'Request failed');
        }
    }
);

// API methods
export const uploadModel = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });

    return response.data;
};

export const createRazorpayOrder = async (orderId, configuredPrice, options) => {
    const response = await api.post('/api/razorpay/create-order', { orderId, configuredPrice, options });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post('/api/payment/verify', paymentData);
    return response.data;
};

export const getOrders = async (params = {}) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
};

export const getOrder = async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
};

export const getOrderStats = async () => {
    const response = await api.get('/api/orders/analytics/stats');
    return response.data;
};

export default api;
