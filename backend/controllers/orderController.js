const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice } = req.body;
        const newOrder = new Order({
            user: req.user.id, // Token verification middleware will set the user ID in req.user
            products,
            totalPrice,
        });
        const savedOrder = await newOrder.save();
        res.status(201).json({ message: "Order created successfully", order: savedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).populate("products.product");
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user").populate("products.product");
        res.status(200).json({ orders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};