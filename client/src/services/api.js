import axios from "axios";

const VITE_API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5005/api";
const ML_BASE = import.meta.env.VITE_ML_URL ?? "http://localhost:8000";

const apiClient = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const mlClient = axios.create({
  baseURL: ML_BASE,
  timeout: 90000, // ViT model inference on CPU can take 30-60s
});

const handleResponse = (response) => response;
const handleError = (error) => {
  const detail = error?.response?.data?.detail;
  if (detail && typeof detail === "string") {
    error.message = detail;
  }
  if (error.code === "ECONNABORTED") {
    error.message = "Skin analysis is taking longer than expected. Please try again in a moment.";
  }
  if (error.message === "Network Error") {
    error.message = "Unable to reach the service. Is it running?";
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use(handleResponse, handleError);
mlClient.interceptors.response.use(handleResponse, handleError);

export const analyzeAssessment = async (payload) => {
  const { data } = await mlClient.post("/api/analyze", payload);
  return data;
};

export const getHealthStatus = async () => {
  const { data } = await mlClient.get("/api/health");
  return data;
};

export const loginWithGoogle = async (credential) => {
  const { data } = await apiClient.post("/auth/google", { credential });
  return data;
};

export default apiClient;
