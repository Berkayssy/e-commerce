import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://e-commerce-backend-ml1p.onrender.com"

});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);  // if token have every request

export default instance;
