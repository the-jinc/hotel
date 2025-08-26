import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API: AxiosInstance = axios.create({
  baseURL: "https://hotel-backend.abdetaterefe.workers.dev/api", // change to your backend URL if different
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
