import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
    timeout: 15000
});

// Temporary in-memory access token.
// A refresh-token flow will be added before production.
let accessToken = null;

export function setAccessToken(token) {
    accessToken = token;
}

export function clearAccessToken() {
    accessToken = null;
}

api.interceptors.request.use(config => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export function getApiError(error) {
    return error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
}

export default api;
