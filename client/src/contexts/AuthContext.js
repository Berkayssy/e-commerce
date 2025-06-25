import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    const login = async (credentials) => {
        try {
            // Eğer credentials bir obje ise ve token içeriyorsa (Google OAuth)
            if (credentials && credentials.token && credentials.user) {
                localStorage.setItem("token", credentials.token);
                localStorage.setItem("role", credentials.user.role);
                setToken(credentials.token);
                setRole(credentials.user.role);
                return;
            }
            
            // Normal login
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, credentials);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            setToken(res.data.token);
            setRole(res.data.user.role);
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);