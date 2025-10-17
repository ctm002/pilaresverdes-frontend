import axios, { InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "",
});

interface JWTPayload {
  exp: number;
}


const isTokenExpiring = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<JWTPayload>(token);
    const now = Date.now() / 1000;
    return exp - now < 300;
  } catch (e) {
    return true;
  }
};


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem("token");
    
    if (isTokenExpiring(token)) {
      // try {
      //   const response = await axios.post("/v1/auth/refresh-token", null, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });
      //   token = response.data.token;
      //   localStorage.setItem("token", token!);
      // } catch (error) {
      // console.error("Error al refrescar token", error);
      localStorage.removeItem("token");
      window.location.href = '/signin';
      // }
    }
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;