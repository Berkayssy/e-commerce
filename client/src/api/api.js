import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://e-commerce-backend-ml1p.onrender.com/api"

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

export const fetchAdminDashboard = async () => {
    const res = await instance.get('/admin/dashboard');
    return res.data;
};

export const googleLogin = async (token) => {
    const res = await instance.post('/auth/google', { token });
    return res.data;
};

// Community API
export const getCommunities = async () => {
    const res = await instance.get('/ping/communities'); // Public endpoint
    return res.data;
};

export const getCommunityById = async (communityId) => {
    const res = await instance.get(`/admin/community/${communityId}`);
    return res.data;
};

// Productları topluluk bazlı getir
export const getProductsByCommunity = async (communityId) => {
    const res = await instance.get(`/products?communityId=${communityId}`);
    return res.data;
};

// Siparişleri topluluk bazlı getir
export const getOrdersByCommunity = async (communityId) => {
    const res = await instance.get(`/orders?communityId=${communityId}`);
    return res.data;
};

// Topluluk oluştur
export const createCommunity = async ({ name, transId, rootAdminId, role }) => {
    const res = await instance.post('/admin/community', { name, transId, rootAdminId, role });
    return res.data;
};

// Topluluğa admin ekle
export const addAdminToCommunity = async ({ communityId, adminId }) => {
    const res = await instance.post('/admin/community/add-admin', { communityId, adminId });
    return res.data;
};

// Topluluktan admin çıkar
export const removeAdminFromCommunity = async ({ communityId, adminId }) => {
    const res = await instance.post('/admin/community/remove-admin', { communityId, adminId });
    return res.data;
};

// Subscription oluştur
export const createSubscription = async ({ user, plan, store }) => {
    const payload = { user, plan };
    if (store) payload.store = store;
    const res = await instance.post('/admin/subscriptions', payload);
    return res.data;
};

// Register + Subscription (all-in-one)
export const createSubscriptionAndRegister = async (payload) => {
    const res = await instance.post('/auth/register-and-subscribe', payload);
    return res.data;
};

export const registerSeller = async (payload) => {
    const res = await instance.post('/sellers/register', payload);
    return res.data;
};

export const assignAdmin = async (payload) => {
    const res = await instance.post('/sellers/assign-admin', payload);
    return res.data;
};

// Seller Profile API
export const getSellerProfile = async () => {
    const res = await instance.get('/sellers/profile');
    return res.data;
};

export const updateSellerProfile = async (payload) => {
    const res = await instance.put('/sellers/profile', payload);
    return res.data;
};
