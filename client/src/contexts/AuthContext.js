import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    const login = async (credentials) => {
        try {
            const res = await axios.post("http://localhost:4000/api/auth/login", credentials);
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