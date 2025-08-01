import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';

const RoleProtectedRoute = ({ children, allowedRoles = ['user'] }) => {
    const { token, role } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleProtectedRoute; 