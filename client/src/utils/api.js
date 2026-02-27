import axios from "axios";

// Keep baseURL as plain origin (no /api suffix).
// All call-sites use absolute paths like "/api/auth/login".
// Axios replaces the entire path when the url starts with "/",
// so having /api in baseURL would silently be dropped on every request.
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: BASE,           // e.g. http://localhost:5005
  withCredentials: true,
});

export default api;
