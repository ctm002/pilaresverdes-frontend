import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

const TIMEOUT_MS = 10_000; // 10 segundos

const api = axios.create({
  baseURL: "",
  timeout: TIMEOUT_MS,
});

interface JWTPayload {
  exp: number;
}

const isTokenExpiring = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<JWTPayload>(token);
    const now = Date.now() / 1000;
    return exp - now < 300; // renueva si quedan menos de 5 min
  } catch {
    return true;
  }
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const doRefresh = async (token: string): Promise<string | null> => {
  try {
    // accessToken y refreshToken deben ser distintos en el backend;
    // aquí se usa el mismo hasta que el backend provea un refresh token separado.
    const dto = { accessToken: token, refreshToken: token };
    const response = await axios.post("/api/v1/auth/refresh-token", dto, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: TIMEOUT_MS,
    });

    const newToken: unknown = response.data?.token ?? response.data;
    if (typeof newToken !== "string" || !newToken) return null;

    localStorage.setItem("token", newToken);
    return newToken;
  } catch {
    return null;
  }
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem("token");
    if (!token) return config;

    if (isTokenExpiring(token)) {
      // Evitar múltiples refresh simultáneos
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefresh(token).finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (!refreshed) {
        localStorage.removeItem("token");
        window.location.href = "/signin";
        return Promise.reject(new Error("Sesión expirada. Por favor, inicia sesión nuevamente."));
      }

      token = refreshed;
    }

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de respuesta: redirige al login si el servidor rechaza el token
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default api;