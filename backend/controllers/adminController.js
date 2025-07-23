const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Community = require("../models/Community");
const Plan = require('../models/Plan');

// Admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total order count
    const totalOrders = await Order.countDocuments();
    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    // Total user count
    const totalUsers = await User.countDocuments();
    // Top selling products (only those that exist in the products collection)
    const topProductsAgg = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.product", totalSold: { $sum: "$products.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $match: { "productInfo.0": { $exists: true } } },
      { $unwind: "$productInfo" },
      { $project: { _id: 0, productId: "$productInfo._id", name: "$productInfo.name", totalSold: 1 } },
      { $limit: 5 }
    ]);
    // Send dashboard stats
    res.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      topProducts: topProductsAgg
    });
  } catch (err) {
    res.status(500).json({ error: 'Not get admin veriables', details: err.message });
  }
};

// Yeni topluluk oluştur (root admin ile)
exports.createCommunity = async (req, res) => {
    try {
        const { name, transId, rootAdminId, role } = req.body;
        // rootAdminId geçerli mi kontrol et
        const rootAdmin = await User.findById(rootAdminId);
        if (!rootAdmin) return res.status(404).json({ message: "Root admin bulunamadı" });
        const community = new Community({
            name,
            transId,
            rootAdmin: rootAdminId,
            admins: [],
            owner: rootAdminId,
            role: role || 'seller'
        });
        await community.save();
        return res.status(201).json(community);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Topluluğa admin ekle (sadece root admin yetkili)
exports.addAdminToCommunity = async (req, res) => {
    try {
        const { communityId, adminId } = req.body;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community bulunamadı" });
        // Sadece root admin ekleyebilir
        if (String(req.user._id) !== String(community.rootAdmin)) {
            return res.status(403).json({ message: "Sadece root admin admin ekleyebilir" });
        }
        if (!community.admins.includes(adminId)) {
            community.admins.push(adminId);
            await community.save();
        }
        return res.status(200).json(community);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Topluluktan admin çıkar (sadece root admin yetkili)
exports.removeAdminFromCommunity = async (req, res) => {
    try {
        const { communityId, adminId } = req.body;
        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community bulunamadı" });
        if (String(req.user._id) !== String(community.rootAdmin)) {
            return res.status(403).json({ message: "Sadece root admin admin çıkarabilir" });
        }
        community.admins = community.admins.filter(id => String(id) !== String(adminId));
        await community.save();
        return res.status(200).json(community);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Topluluk detaylarını getir
exports.getCommunityDetails = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId).populate('rootAdmin admins', 'username email');
        if (!community) return res.status(404).json({ message: "Community bulunamadı" });
        return res.status(200).json(community);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Tüm toplulukları listele
exports.getCommunities = async (req, res) => {
    try {
        const communities = await Community.find().select('name transId _id');
        return res.status(200).json({ communities });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const slugify = (str) => str.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

// Onboarding: Mağaza ve subscription kaydını aynı anda aç
exports.createOnboardingStore = async (req, res) => {
    try {
        const { name, plan, description } = req.body;
        // logo dosyası tekil olmalı
        const logoObj = req.file ? {
            public_id: req.file.public_id,
            url: req.file.secure_url || req.file.path || req.file.url,
            width: req.file.width,
            height: req.file.height,
            format: req.file.format,
            resource_type: req.file.resource_type,
            bytes: req.file.bytes,
            created_at: req.file.created_at,
            original_filename: req.file.originalname || req.file.original_filename
        } : null;
        if (!name || !plan) {
            return res.status(400).json({ message: 'Missing required fields: name and plan are required.' });
        }
        // Generate transId from name
        const transId = slugify(name) + '-' + Date.now();
        // Get owner from authenticated user
        const owner = req.user && req.user.id ? req.user.id : null;
        if (!owner) {
            return res.status(401).json({ message: 'Unauthorized: owner not found.' });
        }
        // Community kaydı
        const community = new Community({
            name,
            transId,
            owner,
            rootAdmin: owner,
            admins: [],
            role: 'seller',
            plan,
            logo: logoObj,
            description: description || ''
        });
        await community.save();

        // Subscription kaydı
        const now = new Date();
        const end = new Date();
        end.setMonth(now.getMonth() + 1); // 1 ay sonrası
        const Subscription = require('../models/Subscription');
        const subscription = new Subscription({
            user: owner,
            plan,
            store: community._id, // <-- Burası önemli!
            startDate: now,
            endDate: end,
            isActive: true
        });
        await subscription.save();

        // Community'ye subscription referansı ekle (opsiyonel)
        community.subscription = subscription._id;
        await community.save();

        return res.status(201).json({ community, subscription });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Sadece subscription kaydı açan endpoint
exports.createSubscription = async (req, res) => {
    try {
        const { user, plan, store } = req.body;
        if (!user || !plan || !store) {
            return res.status(400).json({ message: 'Eksik bilgi: user, plan ve store zorunlu.' });
        }
        const now = new Date();
        const end = new Date();
        end.setMonth(now.getMonth() + 1); // 1 ay sonrası
        const Subscription = require('../models/Subscription');
        const subscription = new Subscription({
            user,
            plan,
            store, // <-- her zaman set edilmeli
            startDate: now,
            endDate: end,
            isActive: true
        });
        await subscription.save();
        return res.status(201).json({ subscription });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Plan oluştur
exports.createPlan = async (req, res) => {
    try {
        const { name, description, price, durationDays, features } = req.body;
        if (!name || price == null || durationDays == null) {
            return res.status(400).json({ message: 'name, price ve durationDays zorunlu.' });
        }
        const plan = new Plan({ name, description, price, durationDays, features });
        await plan.save();
        return res.status(201).json(plan);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Plan adı benzersiz olmalı.' });
        }
        return res.status(500).json({ message: err.message });
    }
};

// Planları listele
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        return res.status(200).json(plans);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Plan detayını getir
exports.getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan bulunamadı.' });
        return res.status(200).json(plan);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Planı güncelle
exports.updatePlan = async (req, res) => {
    try {
        const { name, description, price, durationDays, features } = req.body;
        const plan = await Plan.findByIdAndUpdate(
            req.params.id,
            { name, description, price, durationDays, features },
            { new: true, runValidators: true }
        );
        if (!plan) return res.status(404).json({ message: 'Plan bulunamadı.' });
        return res.status(200).json(plan);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Planı sil
exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan bulunamadı.' });
        return res.status(200).json({ message: 'Plan silindi.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Abonelikleri listele
exports.getSubscriptions = async (req, res) => {
    try {
        const { user } = req.query;
        const filter = user ? { user } : {};
        const Subscription = require('../models/Subscription');
        const subscriptions = await Subscription.find(filter)
            .populate('user', 'username email')
            .populate('plan', 'name price durationDays')
            .populate('store', 'name');
        return res.status(200).json(subscriptions);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Bildirim oluşturucu yardımcı fonksiyon
const Notification = require('../models/Notification');

exports.createNotification = async ({ user, store, type, message, email }) => {
    try {
        const notification = new Notification({ user, store, type, message, email });
        await notification.save();
        return notification;
    } catch (err) {
        return null;
    }
};