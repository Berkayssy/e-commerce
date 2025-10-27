const favoritesService = require('./favorites.service');

exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const result = await favoritesService.addToFavorites({ userId, productId });
        res.status(201).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const result = await favoritesService.removeFromFavorites({ userId, productId });
        res.status(result.status || 200).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.query;

        const result = await favoritesService.checkFavorite({ userId, productId });
        res.status(result.status || 200).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.getFavoriteCount = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await favoritesService.getFavoriteCount(productId);
        res.status(200).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

exports.getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await favoritesService.getUserFavorites(userId);
        res.status(200).json(result);
    }   catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};