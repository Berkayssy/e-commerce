const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pingRoute = require("./routes/ping");
const adminRoutes = require("./routes/adminRoutes"); // Admin routes
const planRoutes = require('./routes/planRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const favoriteController = require('./controllers/favoriteController');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json()); // for read JSON veriables

// API route definitions
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ping", pingRoute);
app.use("/api/admin", adminRoutes); // Admin routes
app.use('/api/plans', planRoutes);
app.use('/api/sellers', sellerRoutes);

// Favorites routes
app.use('/api/favorites', authMiddleware);
app.get('/api/favorites', favoriteController.getUserFavorites);
app.post('/api/favorites/add', favoriteController.addToFavorites);
app.delete('/api/favorites/remove/:productId', favoriteController.removeFromFavorites);
app.get('/api/favorites/check/:productId', favoriteController.checkFavorite);
app.get('/api/favorites/count/:productId', favoriteController.getFavoriteCount);

module.exports = app;