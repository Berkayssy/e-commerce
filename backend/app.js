const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pingRoute = require("./routes/ping");

const app = express();

app.use(cors());
app.use(express.json()); // for read JSON veriables

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ping", pingRoute);

module.exports = app;