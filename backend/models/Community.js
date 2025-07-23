const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    transId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rootAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    visible: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['seller', 'admin'],
        default: 'seller',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: false
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: false
    },
    logo: {
        type: {
            public_id: { type: String },
            url: { type: String },
            width: { type: Number },
            height: { type: Number },
            format: { type: String },
            resource_type: { type: String },
            bytes: { type: Number },
            created_at: { type: Date },
            original_filename: { type: String }
        },
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Community", communitySchema); 