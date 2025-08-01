const User = require('../models/User');
const Product = require('../models/Product');

// Get user's favorites
const getUserFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('favorites.product')
            .select('favorites');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Sort favorites by addedAt (newest first)
        const sortedFavorites = user.favorites.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        res.json({
            success: true,
            favorites: sortedFavorites
        });
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorites'
        });
    }
};

// Add product to favorites
const addToFavorites = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already favorited
        const user = await User.findById(req.user.id);
        const existingFavorite = user.favorites.find(fav => fav.product.toString() === productId);

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: 'Product is already in favorites'
            });
        }

        // Add to favorites
        user.favorites.push({
            product: productId,
            addedAt: new Date()
        });

        await user.save();

        // Populate the newly added favorite
        await user.populate('favorites.product');

        const newFavorite = user.favorites[user.favorites.length - 1];

        res.status(201).json({
            success: true,
            message: 'Product added to favorites',
            favorite: newFavorite
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to favorites'
        });
    }
};

// Remove product from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);
        const favoriteIndex = user.favorites.findIndex(fav => fav.product.toString() === productId);

        if (favoriteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
        }

        // Remove from favorites array
        user.favorites.splice(favoriteIndex, 1);
        await user.save();

        res.json({
            success: true,
            message: 'Product removed from favorites'
        });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove from favorites'
        });
    }
};

// Check if product is favorited
const checkFavorite = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);
        const isFavorited = user.favorites.some(fav => fav.product.toString() === productId);

        res.json({
            success: true,
            isFavorited
        });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check favorite status'
        });
    }
};

// Get favorite count for a product
const getFavoriteCount = async (req, res) => {
    try {
        const { productId } = req.params;

        const count = await User.countDocuments({
            'favorites.product': productId
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error getting favorite count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorite count'
        });
    }
};

module.exports = {
    getUserFavorites,
    addToFavorites,
    removeFromFavorites,
    checkFavorite,
    getFavoriteCount
}; 