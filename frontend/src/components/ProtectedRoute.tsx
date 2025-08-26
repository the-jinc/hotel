// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import type { ProtectedRouteProps } from '../types/protectedRouteProps'; // Import types

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
}