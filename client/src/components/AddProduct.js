import { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";

const INITIAL_FORM_STATE = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
    imageFiles: [],
};

const AddProduct = () => {
    const [product, setProduct] = useState(() => {
        const savedData = localStorage.getItem('productFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const validatedData = {
                    ...INITIAL_FORM_STATE,
                    ...parsedData,
                    imageFiles: []
                };
                return validatedData;
            } catch (err) {
                console.error('Error parsing saved form data:', err);
                localStorage.removeItem('productFormData');
            }
        }
        return INITIAL_FORM_STATE;
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        const newPreviews = product.imageFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newPreviews);

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [product.imageFiles]);

    useEffect(() => {
        const hasData = Object.values(product).some(value => (Array.isArray(value) ? value.length > 0 : value !== "" && value !== null));
        if (hasData) {
            try {
                const dataToSave = { ...product };
                delete dataToSave.imageFiles;
                localStorage.setItem('productFormData', JSON.stringify(dataToSave));
            } catch (err) {
                console.error('Error saving form data:', err);
            }
        }
    }, [product]);

    const validateForm = () => {
        const errors = [];

        if (!product.name.trim()) {
            errors.push("Product name is required");
        }

        if (!product.price) {
            errors.push("Price is required");
        } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
            errors.push("Price must be a positive number");
        }

        if (!product.stock) {
            errors.push("Stock is required");
        } else if (isNaN(Number(product.stock)) || Number(product.stock) <= 0) {
            errors.push("Stock must be a positive number");
        }

        if (errors.length > 0) {
            setError(errors.join(", "));
            return false;
        }

        return true;
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === "imageFiles") {
            setProduct(prev => ({
                ...prev,
                imageFiles: Array.from(files || [])
            }));
            return;
        }

        if (name === "price" || name === "stock") {
            if (value === "") {
                setProduct(prev => ({ ...prev, [name]: "" }));
                return;
            }

            let numValue = value.replace(/[^0-9.]/g, '');

            if (name === "price") {
                if ((numValue.match(/\./g) || []).length > 1) {
                    return;
                }
                if (numValue === "." || (numValue.startsWith("0") && numValue.length > 1 && numValue[1] !== ".")) {
                    numValue = numValue.substring(1);
                } else if (numValue.startsWith("0") && numValue.length > 1 && !numValue.includes('.')) {
                    numValue = String(Number(numValue));
                }
            } else if (name === "stock") {
                if (numValue.includes('.') || (numValue.startsWith("0") && numValue.length > 1)) {
                    numValue = numValue.replace('.', '');
                    if (numValue.startsWith("0") && numValue.length > 1) {
                        numValue = numValue.substring(1);
                    }
                }
            }
            
            setProduct(prev => ({
                ...prev,
                [name]: numValue
            }));
        } else if (name === "imageUrl") {
            return;
        } else {
            setProduct(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError("");
        setSuccessMessage("");
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        if (!product.imageFiles || product.imageFiles.length === 0) {
            setError("En az bir fotoğraf yüklemelisiniz.");
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found");
            }

            const formData = new FormData();
            formData.append("name", product.name);
            formData.append("description", product.description);
            formData.append("price", Number(product.price));
            formData.append("stock", Number(product.stock));
            formData.append("category", product.category);

            if (product.imageFiles && product.imageFiles.length > 0) {
                product.imageFiles.forEach(file => {
                    formData.append("images", file);
                });
            }

            await axios.post(`${process.env.REACT_APP_API_URL}/products`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage("Product added successfully!");
            setProduct(INITIAL_FORM_STATE);
            setImagePreviews([]);
            localStorage.removeItem('productFormData');
        } catch (err) {
            console.error('Error adding product:', err);
            setError(err.response?.data?.error || "Error adding product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setProduct(INITIAL_FORM_STATE);
        setImagePreviews([]);
        localStorage.removeItem('productFormData');
        setError("");
        setSuccessMessage("");
    };

    return (
        <div className="add-product-container">
            <h2 className="add-product-title">Add New Product</h2>
            <form className="add-product-form" onSubmit={handleSubmit}>
                <input 
                    className="add-product-input" 
                    type="text" 
                    name="name" 
                    placeholder="Product Name" 
                    value={product.name} 
                    onChange={handleChange} 
                    required
                />
                <textarea 
                    className="add-product-textarea" 
                    name="description" 
                    placeholder="Description" 
                    value={product.description} 
                    onChange={handleChange} 
                />
                <input 
                    className="add-product-input" 
                    type="text" 
                    name="price" 
                    placeholder="Price" 
                    value={product.price} 
                    onChange={handleChange} 
                    required
                />
                <input 
                    className="add-product-input" 
                    type="text" 
                    name="stock" 
                    placeholder="Stock" 
                    value={product.stock} 
                    onChange={handleChange} 
                    required
                />
                <input 
                    className="add-product-input" 
                    type="text" 
                    name="category" 
                    placeholder="Category" 
                    value={product.category} 
                    onChange={handleChange} 
                />
                <input 
                    className="add-product-input file-input" 
                    type="file"
                    name="imageFiles"
                    accept="image/*"
                    multiple
                    onChange={handleChange} 
                />
                {imagePreviews.length > 0 && (
                    <div className="image-previews-container">
                        {imagePreviews.map((src, index) => (
                            <img key={index} src={src} alt={`Product preview ${index + 1}`} className="image-preview-thumbnail" />
                        ))}
                    </div>
                )}
                <div className="form-buttons">
                    <button 
                        className="add-product-button" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Product'}
                    </button>
                    <button 
                        className="clear-form-button" 
                        type="button" 
                        onClick={clearForm}
                        disabled={isSubmitting}
                    >
                        Clear Form
                    </button>
                </div>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default AddProduct;
