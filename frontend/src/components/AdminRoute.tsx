import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import React from "react";

interface AdminRouteProps {
  children: React.ReactElement;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isInitialized } = useAuthStore();

  // While auth state is initializing (e.g., page refresh) avoid redirect flicker
  if (!isInitialized) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <span className="text-gray-500 text-sm">Checking admin access...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
