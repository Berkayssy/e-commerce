const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "Generic",
    },
    images: [String],
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: false, // backward compatible
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
