const Product = require("../models/Product");

exports.createProducts = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const imageFiles = req.files;
        const images = imageFiles && imageFiles.length > 0
            ? imageFiles.map(file => file.secure_url || file.path || file.url)
            : ["https://res.cloudinary.com/demo/image/upload/v1719240000/no-image.png"];

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            images
        });
        await newProduct.save();

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Find all products
        res.status(200).json({ products });
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
        const { name, description, price, stock, category } = req.body;
        let existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
        if (existingImages.length === 0 && req.body.imageUrl) {
            existingImages.push(req.body.imageUrl);
        }
        const newImageFiles = req.files || [];
        const newImages = newImageFiles.map(file => file.secure_url || file.path);
        const images = [...existingImages, ...newImages];

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, stock, category, images },
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
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
}