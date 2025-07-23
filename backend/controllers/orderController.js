const Order = require("../models/Order");
const Product = require("../models/Product");
const Community = require("../models/Community"); // Added Community model import

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice, contactInfo, paymentInfo } = req.body;

        // Validate required fields
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Products array is required and must not be empty" });
        }

        if (!totalPrice || totalPrice <= 0) {
            return res.status(400).json({ error: "Valid total price is required" });
        }

        if (
            !contactInfo?.fullName ||
            !contactInfo?.phone ||
            !contactInfo?.email ||
            !contactInfo?.address
        ) {
            return res.status(400).json({ error: "All contact information is required" });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactInfo.email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (
            !paymentInfo?.cardHolder ||
            !paymentInfo?.cardLast4 ||
            !paymentInfo?.expiry
        ) {
            return res.status(400).json({ error: "All payment information is required" });
        }

        // Validate card last 4 digits
        if (!/^\d{4}$/.test(paymentInfo.cardLast4)) {
            return res.status(400).json({ error: "Card last 4 digits must be exactly 4 numbers" });
        }

        // Her ürün için communityId'yi Product modelinden al
        const productsWithCommunity = await Promise.all(products.map(async (item) => {
            const productDoc = await Product.findById(item.product);
            if (!productDoc) throw new Error("Product not found: " + item.product);
            return {
                ...item,
                communityId: productDoc.communityId
            };
        }));
        // Siparişteki tüm unique communityId'leri topla
        const communityIds = [...new Set(productsWithCommunity.map(p => String(p.communityId)).filter(Boolean))];

        const newOrder = new Order({
            user: req.user?.id || null,
            products: productsWithCommunity,
            totalPrice,
            contactInfo,
            paymentInfo,
            communityIds
        });

        const savedOrder = await newOrder.save();
        return res.status(201).json({ 
            message: "Order created successfully", 
            order: savedOrder 
        });
    } catch (err) {
        return res.status(500).json({ 
            error: "Failed to create order",
            details: err.message 
        });
    }
};

// User Orders
exports.getMyOrders = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const orders = await Order.find({ user: req.user.id })
            .populate("products.product")
            .sort({ createdAt: -1 }); // Sort by newest first

        return res.status(200).json({ orders });
    } catch (err) {
        return res.status(500).json({ 
            error: "Failed to fetch orders",
            details: err.message 
        });
    }
};

// Admin Panel Orders
exports.getAllOrders = async (req, res) => {
    try {
        const { communityId } = req.query;
        let orders = [];
        if (communityId) {
            orders = await Order.find({ communityIds: communityId })
                .populate("user", "username email")
                .populate("products.product")
                .sort({ createdAt: -1 });
        }
        // communityId yoksa boş dizi döndür
        return res.status(200).json({ orders });
    } catch (err) {
        return res.status(500).json({ 
            error: "Failed to fetch orders",
            details: err.message 
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }
        // Validate status value
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: "Invalid status",
                validStatuses 
            });
        }
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Sadece ilgili community'nin admin/root admin'i güncelleyebilir
        if (req.user && req.user.role === 'admin') {
            const community = await Community.findOne({
                $or: [
                    { rootAdmin: req.user._id },
                    { admins: req.user._id }
                ]
            });
            if (!community || !order.communityIds.map(cid => String(cid)).includes(String(community._id))) {
                return res.status(403).json({ error: "Bu siparişi güncelleme yetkiniz yok" });
            }
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("user", "username email")
         .populate("products.product");
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        return res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder,
        });
    } catch (err) {
        return res.status(500).json({ 
            error: "Failed to update order status",
            details: err.message 
        });
    }
};