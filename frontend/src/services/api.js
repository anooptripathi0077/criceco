import axios from 'axios';

// 1. Connects to your Node.js Backend
// baseURL should point exactly to your backend URL + /api
export const backendAPI = axios.create({
    baseURL: 'https://secureseat-3.onrender.com/api', 
    withCredentials: true
});

// Interceptor for passing credentials/cookies
backendAPI.interceptors.request.use((config) => {
    return config;
});

// 2. Connects to your Python AI Service
// baseURL should point exactly to your AI service URL
export const aiAPI = axios.create({
    baseURL: 'https://secureseat-2.onrender.com',
});