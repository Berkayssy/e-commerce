import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Token'dan user bilgisini çek
    const fetchUserFromToken = async (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            
            if (payload.role === 'seller' && payload.sellerId) {
                // Seller için profile endpoint'ini çağır
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = res.data.userId; // Seller'ın user bilgisi
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
                console.log('Fetched user data:', userData);
            } else {
                // Normal user için token'dan bilgi çek
                const userData = {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role
                };
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Token'dan role'ü parse et ve localStorage'a kaydet
    useEffect(() => {
        if (token && !role) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.role) {
                    localStorage.setItem("role", payload.role);
                    setRole(payload.role);
                }
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, [token, role]);

    // Token varsa user bilgisini çek
    useEffect(() => {
        if (token && !user) {
            fetchUserFromToken(token);
        }
    }, [token, user]);

    // Merkezi temizlik fonksiyonu
    const clearAppStorage = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("basket");
        localStorage.removeItem("order");
        localStorage.removeItem("user");
        setToken(null);
        setRole(null);
        setUser(null);
        // Diğer contextlerdeki state'ler için de benzer şekilde clear fonksiyonları tetiklenebilir
    };

    // Uygulama ilk açılışında temizlik (giriş yoksa)
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            clearAppStorage();
        }
    }, []);

    const login = async (credentials) => {
        try {
            // Eğer credentials bir obje ise ve token içeriyorsa (Google OAuth)
            if (credentials && credentials.token && credentials.user) {
                localStorage.setItem("token", credentials.token);
                localStorage.setItem("role", credentials.user.role);
                localStorage.setItem("user", JSON.stringify(credentials.user));
                setToken(credentials.token);
                setRole(credentials.user.role);
                setUser(credentials.user);
                return;
            }
            
            // Normal login
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, credentials);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setToken(res.data.token);
            setRole(res.data.user.role);
            setUser(res.data.user);
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        clearAppStorage();
    };

    return (
        <AuthContext.Provider value={{ token, role, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);