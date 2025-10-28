import axios from "axios";
import { getItem } from "expo-secure-store";
// export const baseUrl = 'http://192.168.254.21:5000';
export const baseUrl = "https://split-share-backend.onraender.com";
export const apiBaseUrl = `${baseUrl}`;
console.log("API Base URL:", apiBaseUrl);

// Test API connectivity
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection...");
    const response = await axiosInstance.get("/health");
    console.log("API Connection Test Success:", response.status);
    return true;
  } catch (error) {
    console.error("API Connection Test Failed:", error);
    return false;
  }
};

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// intercept and add the token to the request headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
