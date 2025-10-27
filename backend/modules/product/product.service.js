// modules/product/product.service.js - GÜNCELLE
const Product = require("../../models/Product");
const Community = require("../../models/Community");
const ProductCache = require("../../cache/productCache"); // ✅ YENİ

exports.getProductById = async (id) => {
  try {
    // ✅ Önce cache'den kontrol et
    const cachedProduct = await ProductCache.getProductById(id);
    if (cachedProduct) {
      console.log(`✅ Product ${id} served from cache`);
      return {
        success: true,
        status: 200,
        product: cachedProduct,
        cached: true,
      };
    }

    // Cache'de yoksa database'den getir
    const product = await Product.findById(id);
    if (!product)
      return { success: false, status: 404, message: "Product not found" };

    // ✅ Cache'e kaydet
    await ProductCache.setProductById(id, product);
    console.log(`✅ Product ${id} cached`);

    return { success: true, status: 200, product, cached: false };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to fetch product",
      details: err.message,
    };
  }
};

exports.advancedSearch = async (queryParams) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      brand,
      sortBy,
      page = 1,
      limit = 20,
    } = queryParams;

    // ✅ Cache key oluştur
    const cacheKey = `search:${q || ""}:${category || ""}:${minPrice || ""}:${
      maxPrice || ""
    }:${brand || ""}:${sortBy || ""}:${page}:${limit}`;

    // Önce cache'den kontrol et
    const cachedResults = await ProductCache.getProductList(cacheKey);
    if (cachedResults) {
      console.log(`✅ Search results served from cache: ${cacheKey}`);
      return {
        ...cachedResults,
        cached: true,
      };
    }

    // Build search query
    let searchQuery = {};

    // Text search
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      searchQuery.brand = { $regex: brand, $options: "i" };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case "price_asc":
        sortOptions.price = 1;
        break;
      case "price_desc":
        sortOptions.price = -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "name":
        sortOptions.name = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Execute search with pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("communityId", "name transId");

    const total = await Product.countDocuments(searchQuery);

    const result = {
      success: true,
      status: 200,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        searchTerm: q,
        category,
        priceRange: { min: minPrice, max: maxPrice },
        brand,
      },
    };

    // ✅ Cache'e kaydet
    await ProductCache.setProductList(cacheKey, result);
    console.log(`✅ Search results cached: ${cacheKey}`);

    return { ...result, cached: false };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Failed to perform search",
      details: error.message,
    };
  }
};

exports.getAllProducts = async (communityId) => {
  try {
    // ✅ Cache key oluştur
    const cacheKey = `all:${communityId || "global"}`;

    // Önce cache'den kontrol et
    const cachedResults = await ProductCache.getProductList(cacheKey);
    if (cachedResults) {
      console.log(`✅ All products served from cache: ${cacheKey}`);
      return {
        ...cachedResults,
        cached: true,
      };
    }

    let products = [];
    let community = null;
    if (communityId) {
      products = await Product.find({ communityId });
      community = await Community.findById(communityId);
    }

    const result = { success: true, status: 200, products, community };

    // ✅ Cache'e kaydet
    await ProductCache.setProductList(cacheKey, result);
    console.log(`✅ All products cached: ${cacheKey}`);

    return { ...result, cached: false };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to fetch products",
      details: err.message,
    };
  }
};

// ✅ Product update/delete'te cache invalidation
exports.updateProduct = async (id, body, files, user) => {
  try {
    const { name, description, price, stock, category, brand } = body;

    let existingImages = body.existingImages
      ? JSON.parse(body.existingImages)
      : [];
    if (existingImages.length === 0 && body.imageUrl)
      existingImages.push(body.imageUrl);

    const newImages = (files || []).map((file) => file.secure_url || file.path);
    const images = [...existingImages, ...newImages];

    const product = await Product.findById(id);
    if (!product)
      return { success: false, status: 404, message: "Product not found" };

    // Admin yetkisi kontrolü
    if (user && user.role === "admin") {
      const community = await Community.findOne({
        $or: [{ rootAdmin: user._id }, { admins: user._id }],
      });
      if (!community || String(product.communityId) !== String(community._id)) {
        return {
          success: false,
          status: 403,
          message: "You are not authorized to update this product",
        };
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, category, brand, images },
      { new: true }
    );

    // ✅ Cache'i temizle
    await ProductCache.invalidateProduct(id);
    console.log(`✅ Cache invalidated for updated product ${id}`);

    return {
      success: true,
      status: 200,
      message: "Product updated successfully",
      product: updatedProduct,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to update product",
      details: err.message,
    };
  }
};

exports.deleteProduct = async (id, user) => {
  try {
    const product = await Product.findById(id);
    if (!product)
      return { success: false, status: 404, message: "Product not found" };

    if (user && user.role === "admin") {
      const community = await Community.findOne({
        $or: [{ rootAdmin: user._id }, { admins: user._id }],
      });
      if (!community || String(product.communityId) !== String(community._id)) {
        return {
          success: false,
          status: 403,
          message: "You are not authorized to delete this product",
        };
      }
    }

    await Product.findByIdAndDelete(id);

    // ✅ Cache'i temizle
    await ProductCache.invalidateProduct(id);
    console.log(`✅ Cache invalidated for deleted product ${id}`);

    return {
      success: true,
      status: 200,
      message: "Product deleted successfully",
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      message: "Failed to delete product",
      details: err.message,
    };
  }
};
