import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { principal, loading } = useAuth();
    const location = useLocation();

    // console.log("Protected Route state:", { principal, loading, path: location.pathname });

    if (loading) {
        return (
            <div className="h-screen w-full flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!principal) {
        // Store the path user was trying to access
        sessionStorage.setItem('redirectPath', location.pathname);
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;