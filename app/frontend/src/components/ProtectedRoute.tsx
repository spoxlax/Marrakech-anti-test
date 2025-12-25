import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authCore';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to explicit unauthorized page for clear feedback
        return <Navigate to="/unauthorized" replace />;
    }

    // Render children if provided, otherwise Outlet
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
