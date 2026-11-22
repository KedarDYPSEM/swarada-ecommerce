import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-[#C5A05A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-heading text-lg text-[#641B32]">Loading Swarada Saree Center...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = requireAdmin ? '/admin/login' : '/account/login';
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
