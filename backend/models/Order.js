const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // If not login, will be null
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    contactInfo: {
        fullName: { 
            type: String, 
            required: true,
            trim: true 
        },
        phone: { 
            type: String, 
            required: true,
            trim: true 
        },
        email: { 
            type: String, 
            required: true,
            trim: true,
            lowercase: true 
        },
        address: { 
            type: String, 
            required: true,
            trim: true 
        },
    },
    paymentInfo: {
        cardHolder: { 
            type: String, 
            required: true,
            trim: true 
        },
        cardLast4: { 
            type: String, 
            required: true,
            trim: true,
            minlength: 4,
            maxlength: 4
        },
        expiry: { 
            type: String, 
            required: true,
            trim: true 
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
});

module.exports = mongoose.model("Order", OrderSchema);