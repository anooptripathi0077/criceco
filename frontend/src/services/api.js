import axios from 'axios';

// 1. Connects to your Node.js Backend
// baseURL should point exactly to your backend URL + /api
export const backendAPI = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:5000/api',
    withCredentials: true
});

// Interceptor for passing credentials/cookies
backendAPI.interceptors.request.use((config) => {
    return config;
});

// 2. Connects to your Python AI Service
// baseURL should point exactly to your AI service URL
export const aiAPI = axios.create({
    baseURL: import.meta.env.VITE_AI_SERVICE_URL ?? 'http://localhost:8000',
});