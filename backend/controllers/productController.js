const Product = require("../models/Product");
const Community = require("../models/Community");

exports.createProducts = async (req, res) => {
    try {
        const { name, description, price, stock, category, brand, communityId: bodyCommunityId } = req.body;
        const imageFiles = req.files;
        const images = imageFiles && imageFiles.length > 0
            ? imageFiles.map(file => file.secure_url || file.path || file.url)
            : ["https://res.cloudinary.com/demo/image/upload/v1719240000/no-image.png"];

        // Adminin bağlı olduğu communityId'yi bul
        let communityId = bodyCommunityId;
        if (!communityId) {
            // Kullanıcı rootAdmin veya admins içinde mi?
            const community = await Community.findOne({
                $or: [
                    { rootAdmin: req.user._id },
                    { admins: req.user._id }
                ]
            });
            if (!community) {
                return res.status(403).json({ error: "Bu kullanıcıya ait bir community bulunamadı" });
            }
            communityId = community._id;
        }
        // Ek zorunlu kontrol
        if (!communityId) {
            return res.status(400).json({ error: "communityId is required" });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            brand,
            images,
            communityId
        });
        await newProduct.save();

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { communityId } = req.query;
        let products = [];
        let community = null;
        if (communityId) {
            products = await Product.find({ communityId });
            community = await Community.findById(communityId);
        }
        // communityId yoksa boş dizi ve null community döndür
        res.status(200).json({ products, community });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, brand } = req.body;
        let existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        if (existingImages.length === 0 && req.body.imageUrl) {
            existingImages.push(req.body.imageUrl);
        }
        const newImageFiles = req.files || [];
        const newImages = newImageFiles.map(file => file.secure_url || file.path);
        const images = [...existingImages, ...newImages];

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        // Sadece ilgili community'nin admin/root admin'i güncelleyebilir
        if (req.user && req.user.role === 'admin') {
            const community = await Community.findOne({
                $or: [
                    { rootAdmin: req.user._id },
                    { admins: req.user._id }
                ]
            });
            if (!community || String(product.communityId) !== String(community._id)) {
                return res.status(403).json({ error: "Bu ürünü güncelleme yetkiniz yok" });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, stock, category, brand, images },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        // Sadece ilgili community'nin admin/root admin'i silebilir
        if (req.user && req.user.role === 'admin') {
            const community = await Community.findOne({
                $or: [
                    { rootAdmin: req.user._id },
                    { admins: req.user._id }
                ]
            });
            if (!community || String(product.communityId) !== String(community._id)) {
                return res.status(403).json({ error: "Bu ürünü silme yetkiniz yok" });
            }
        }
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};