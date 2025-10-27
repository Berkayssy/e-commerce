const productService = require("../product/product.service");

exports.createProduct = async (req, res) => {
  try {
    const result = await productService.createProduct(
      req.user,
      req.body,
      req.files
    );
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query.communityId);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const result = await productService.getProductById(req.params.id);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const result = await productService.updateProduct(
      req.params.id,
      req.body,
      req.files,
      req.user
    );
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

// modules/product/product.controller.js - EKLE
exports.advancedSearch = async (req, res) => {
  try {
    const result = await productService.advancedSearch(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.getCategoryFilters = async (req, res) => {
  try {
    const result = await productService.getCategoryFilters();
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.updateProductStock = async (req, res) => {
  try {
    const result = await productService.updateProductStock(
      req.params.id,
      req.body.stock
    );
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const result = await productService.getSellerProducts(req.params.sellerId);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
