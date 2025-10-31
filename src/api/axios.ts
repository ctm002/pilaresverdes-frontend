import axios, { InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "",
});

interface JWTPayload {
  exp: number;
}


const isTokenExpiring = (token: string): boolean => {
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
    
    // console.log(`token: ${token}`);
    if (!token) return config;

    if (isTokenExpiring(token)) {
      try {

        const dto = {
          accessToken: token,
          refreshToken: token
        };


        const response = await axios.post("/api/v1/auth/refresh-token", dto, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        token = response.data.token;
        localStorage.setItem("token", token!);

        
      } catch (error) {
        console.error("Error al refrescar token", error);
        localStorage.removeItem("token");
        window.location.href = '/signin';
      }
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