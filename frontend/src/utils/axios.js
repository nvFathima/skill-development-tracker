// src/utils/axios.js
import axios from 'axios';

const baseURL = 'http://localhost:8800';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear storage and redirect to login
            localStorage.clear();
            window.location.href = '/log-in';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;