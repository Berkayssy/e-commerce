const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
    // Reference to User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Personal Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    
    // Address Information
    country: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    
    // Billing Information (encrypted)
    cardInfo: {
        cardNumber: {
            type: String,
            required: false // Optional for free plans
        },
        cardExpiry: {
            type: String,
            required: false
        },
        cardCvv: {
            type: String,
            required: false
        },
        billingAddress: {
            type: String,
            required: false
        }
    },
    
    // Plan and Subscription
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    planStartDate: {
        type: Date,
        default: Date.now
    },
    planEndDate: {
        type: Date,
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Store/Community Reference
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: false // Will be set after store creation
    },
    
    // Notifications and Preferences
    emailNotifications: {
        type: Boolean,
        default: true
    },
    planReminders: {
        type: Boolean,
        default: true
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending', 'expired'],
        default: 'pending'
    },
    
    // KYC and Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: {
        type: Date
    }
    
}, {
    timestamps: true
});

// Index for efficient queries
sellerSchema.index({ planEndDate: 1, isActive: 1 });
sellerSchema.index({ status: 1 });

module.exports = mongoose.model("Seller", sellerSchema); 