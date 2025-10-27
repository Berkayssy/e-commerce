const User = require("../../models/User");
const Product = require("../../models/Product");
const { createError } = require("../../utils/errorHandler");

exports.addToFavorites = async ({ userId, productId }) => {
  if (!productId) throw createError("Product ID is required", 400);

  const product = await Product.findById(productId);
  if (!product) throw createError("Product not found", 404);

  const user = await User.findById(userId).populate("favorites.product");
  if (!user) throw createError("User not found", 404);

  const alreadyFavorited = user.favorites.some(
    (fav) => fav.product._id.toString() === productId
  );
  if (alreadyFavorited) throw createError("Product is already favorited", 400);

  user.favorites.push({
    product: productId,
    addedAt: new Date(),
  });
  await user.save();
  await user.populate("favorites.product");

  return {
    success: true,
    message: "Product added to favorites",
    favorite: user.favorites[user.favorites.length - 1],
  };
};

exports.removeFromFavorites = async ({ userId, productId }) => {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const favoriteIndex = user.favorites.findIndex(
    (fav) => fav.product.toString() === productId
  );
  if (favoriteIndex === -1) throw createError("Product not in favorites", 404);

  user.favorites.splice(favoriteIndex, 1);
  await user.save();

  return { success: true, message: "Product removed from favorites" };
};

exports.checkFavorite = async ({ userId, productId }) => {
  const user = await User.findById(userId);
  if (!user) throw createError("User not found", 404);

  const isFavorited = user.favorites.some(
    (fav) => fav.product.toString() === productId
  );

  return { success: true, isFavorited };
};

exports.getFavoriteCount = async (productId) => {
  if (!productId) throw createError("Product ID is required", 400);

  const count = await User.countDocuments({ "favorites.product": productId });
  return { success: true, count };
};

exports.getUserFavorites = async (userId) => {
  if (!userId) throw createError("User ID is required", 400);

  const user = await User.findById(userId)
    .populate("favorites.product")
    .select("favorites");

  if (!user) throw createError("User not found", 404);

  const sortedFavorites = user.favorites.sort(
    (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  );

  return { success: true, favorites: sortedFavorites };
};
