const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pingRoute = require("./routes/ping");
const adminRoutes = require("./routes/adminRoutes"); // Admin routes

const app = express();

app.use(cors());
app.use(express.json()); // for read JSON veriables

// API route definitions
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ping", pingRoute);
app.use("/api/admin", adminRoutes); // Admin routes

module.exports = app;