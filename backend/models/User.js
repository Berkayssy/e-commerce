const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'seller'],
        default: 'user'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePicture: {
        type: String
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: false
    }
},{timestamps: true});

module.exports = mongoose.model("User", userSchema);