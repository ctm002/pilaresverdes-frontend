import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: ReactNode;
}

interface JWTPayload {
  exp: number;
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
    localStorage.removeItem("token"); // Limpia tokens expirados o malformados
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoute;