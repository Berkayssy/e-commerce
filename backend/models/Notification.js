const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: false },
    type: { type: String, enum: ['plan', 'order', 'system', 'custom'], default: 'system' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    email: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 