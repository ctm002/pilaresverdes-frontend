import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "../dto/AuthDto.js";

const TIMEOUT_MS = 10_000;

const api = axios.create({
  baseURL: "",
  timeout: TIMEOUT_MS,
});

const isTokenExpiring = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<JWTPayload>(token);
    return exp - Date.now() / 1000 < 300;
  } catch {
    return true;
  }
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const doRefresh = async (token: string): Promise<string | null> => {
  try {
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
