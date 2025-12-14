import axios from "axios";
import { getItem } from "expo-secure-store";
// export const baseUrl = 'http://192.168.254.152:9000';
export const baseUrl = "https://split-share-backend.onrender.com";
export const apiBaseUrl = `${baseUrl}`;
console.log("API ", apiBaseUrl);

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// intercept and add the token to the request headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
