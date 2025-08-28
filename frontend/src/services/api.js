// src/services/api.js
import axios from "axios";

// Em produção, o React é servido pelo MESMO backend => mesma origem:
const baseURL = process.env.REACT_APP_API_BASE_URL || window.location.origin;

const api = axios.create({
  baseURL, // ex.: http://127.0.0.1:5080
  headers: { "Content-Type": "application/json" },
});

export default api;

// Helpers opcionais (garantem prefixo /api)
export const get = (url, cfg) =>
  api.get(url.startsWith("/api") ? url : `/api${url}`, cfg);
export const post = (url, data, cfg) =>
  api.post(url.startsWith("/api") ? url : `/api${url}`, data, cfg);
