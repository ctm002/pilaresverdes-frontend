import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "./dto/AuthDto.js";

interface ProtectedRouteProps {
  children: ReactNode;
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const { exp } = jwtDecode<JWTPayload>(token);
    return Date.now() / 1000 < exp;
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/signin" replace />;
  }
  return children;
}

export default ProtectedRoute;
