import axios from "axios";

const apiOrigin = import.meta.env.VITE_API_URL?.trim();

const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin.replace(/\/+$/, "")}/api` : undefined,
});

api.interceptors.request.use((config) => {
  if (!apiOrigin) {
    return Promise.reject(
      new Error("API configuration is missing. Set VITE_API_URL to the backend origin."),
    );
  }

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;