import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const USER_ID = 1;

// Global interceptor to attach JWT token to all requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('fitai_token');
        if (token && config.url && config.url.startsWith(API_BASE_URL)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
