import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const authApi = axios.create({
  baseURL: `${API_BASE}/auth`,
  headers: { "Content-Type": "application/json" }
});

export const register = (payload) => authApi.post("/register", payload);
export const login = (payload) => authApi.post("/login", payload);

// channels and messages (protected)
const api = axios.create({
  baseURL: API_BASE,
});

// attach token helper
export const withAuth = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };
};

export const fetchChannels = () => api.get("/channel", withAuth());
export const createChannel = (data) => api.post("/channel", data, withAuth());
export const fetchChannelMessages = (channelId, params = {}) =>
  api.get(`/channels/${channelId}/messages`, { ...withAuth(), params });
