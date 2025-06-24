const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    images: [String]
},{timestamps: true});

module.exports = mongoose.model("Product", productSchema);