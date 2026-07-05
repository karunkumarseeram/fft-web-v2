import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
  // withCredentials: true, // only if you plan to send cookies
});

// attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;