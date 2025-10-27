const { body, query, param } = require('express-validator');

exports.addToFavoritesValidator = [
    body('productId').notEmpty().withMessage('Product ID is required'),
];

exports.removeFromFavoritesValidator = [
    body('productId').notEmpty().withMessage('Product ID is required'),
];

exports.checkFavoriteValidator = [
    query('productId').notEmpty().withMessage('Product ID is required'),
];

exports.getFavoriteCountValidator = [
    param('productId').notEmpty().withMessage('Product ID is required'),
];