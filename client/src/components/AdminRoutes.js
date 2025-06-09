import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

const AdminRoutes = ({ children }) => {
    const { token, role } = useAuth();

    if (!token || role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoutes;