import axios from "axios";
// import { getItem } from "expo-secure-store";
import * as SecureStore from "expo-secure-store";


// export const baseUrl = 'http://192.168.1.122:9000';
// export const baseUrl = "https://split-share-backend.onrender.com";
export const baseUrl = "https://split-share-backend-production.up.railway.app/"

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
    // const token = await getItem("token");
    const token = await SecureStore.getItemAsync("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
