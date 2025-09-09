// src/api/axios.js
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const api = axios.create({
  baseURL: "",
});

// Función para saber si un token está por expirar
const isTokenExpiring = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    return exp - now < 300; // si faltan menos de 5 min
  } catch (e) {
    return true;
  }
};

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");

    if (isTokenExpiring(token)) {
      try {
        const response = await axios.post("/v1/auth/refresh-token", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        token = response.data.token;
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Error al refrescar token", error);
        // Opcional: redirigir a login
        navigate('/signin');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
