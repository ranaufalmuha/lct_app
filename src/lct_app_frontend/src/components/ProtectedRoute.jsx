// ProtectedRoute.jsx
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { principal, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!principal) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
