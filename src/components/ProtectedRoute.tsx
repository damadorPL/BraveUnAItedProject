import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentSpecialist } = useApp();
  const location = useLocation();

  if (!currentSpecialist) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !currentSpecialist.isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
