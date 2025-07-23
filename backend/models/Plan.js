const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true }, // Plan süresi (gün)
    features: [String],
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema); 