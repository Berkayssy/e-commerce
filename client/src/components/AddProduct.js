import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGsap } from '../contexts/GsapContext';
import ErrorMessage from './common/ErrorMessage';
import LoadingSpinner from './common/LoadingSpinner';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProductRefs } = useGsap();
  const { pageRef, formRef, imagePreviewRef } = addProductRefs;
  const STORAGE_KEY = 'addProductFormData';

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          brand: ''
        };
  });

  // formData değiştikçe localStorage'a yaz
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const categories = ['Luxury Car', 'Sport Car', 'Classic Car', 'Electric Car', 'SUV', 'Sedan'];
  const brands = [
    'Mercedes', 'BMW', 'Maserati', 'Ferrari', 'Porsche', 'Audi', 
    'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 
    'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg', 'Chevrolet', 'Generic'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      const removed = prev[index];
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    
    // Adjust main image index
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await axios.post(`${process.env.REACT_APP_API_URL}/products`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Başarılı submit sonrası localStorage temizle
      localStorage.removeItem(STORAGE_KEY);

      setSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  // Formu temizle
  const handleClear = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      brand: ''
    });
    setImages([]);
    setPreviewImages([]);
    setMainImageIndex(0);
  };

  const formFields = [
    { name: 'name', type: 'text', label: 'Product Name', placeholder: 'Enter product name', required: true },
    { name: 'description', type: 'textarea', label: 'Description', placeholder: 'Enter product description', rows: 4, required: true },
    { name: 'price', type: 'number', label: 'Price ($)', placeholder: '0.00', step: '0.01', min: '0', required: true },
    { name: 'stock', type: 'number', label: 'Stock', placeholder: '0', min: '0', required: true },
    { name: 'category', type: 'select', label: 'Category', required: true, options: categories },
    { name: 'brand', type: 'select', label: 'Brand', required: true, options: brands }
  ];

  const renderFormField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name],
      onChange: handleInputChange,
      className: field.type === 'textarea' ? 'form-textarea' : field.type === 'select' ? 'form-select' : 'form-input',
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={field.rows} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select a category</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return <input type={field.type} {...commonProps} step={field.step} min={field.min} />;
    }
  };

  return (
    <div className="page-container" ref={pageRef}>
      <div className="add-product-mainbox">
        <div className="add-product-header">
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Create a new product for your store</p>
        </div>
        <div className="add-product-flex">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="add-product-form" ref={formRef}>
            <div className="form-group name-group">
              <label htmlFor="name" className="form-label">Product Name</label>
              {renderFormField(formFields[0])}
            </div>
            <div className="form-group description-group">
              <label htmlFor="description" className="form-label">Description</label>
              {renderFormField(formFields[1])}
            </div>
            <div className="form-group images-group">
              <label htmlFor="images" className="form-label">Product Images</label>
              <div
                className="file-input-wrapper"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  className="form-file-input"
                  multiple
                  accept="image/*"
                />
                <span className="file-input-text">Choose file or drag here</span>
              </div>
              {previewImages.length > 0 && (
                <div className="selected-images-list">
                  {previewImages.map((preview, idx) => (
                    <div 
                      key={idx} 
                      className={`selected-image-thumb${mainImageIndex === idx ? ' main-thumb' : ''}`}
                      onClick={() => setMainImageIndex(idx)}
                    >
                      <img src={preview.preview} alt={`Selected ${idx + 1}`} />
                      <button 
                        type="button" 
                        className="remove-thumbnail-btn" 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price ($)</label>
                {renderFormField(formFields[2])}
              </div>
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                {renderFormField(formFields[4])}
              </div>
              <div className="form-group">
                <label htmlFor="brand" className="form-label">Brand</label>
                {renderFormField(formFields[5])}
              </div>
              <div className="form-group">
                <label htmlFor="stock" className="form-label">Stock</label>
                {renderFormField(formFields[3])}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    Adding Product...
                  </>
                ) : (
                  <>Add Product</>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn clear-btn"
                disabled={loading}
              >
                Clear
              </button>
            </div>
            <ErrorMessage error={error} />
            {success && (
              <div className="success-message">
                Product added successfully! Redirecting...
              </div>
            )}
          </form>
          {/* Preview Section */}
          <div className="preview-section" ref={imagePreviewRef}>
            <h3 className="preview-title">Product Preview</h3>
            <div className="preview-content">
              <div className="preview-image-container">
                {previewImages.length > 0 ? (
                  <img
                    src={previewImages[mainImageIndex]?.preview}
                    alt="Product preview"
                    className="preview-main-image"
                  />
                ) : (
                  <div className="preview-placeholder">
                    <span role="img" aria-label="image">🖼️</span>
                    <p>No images selected</p>
                  </div>
                )}
              </div>
              <div className="preview-details">
                <h4 className="preview-name">
                  {formData.name || 'Product Name'}
                </h4>
                <div className="preview-meta">
                  <span className="preview-category">
                    {formData.category || 'Category'}
                  </span>
                  <span className="preview-stock">
                    Stock: {formData.stock || '0'}
                  </span>
                </div>
                <div className="preview-price price price-lg">
                  {formData.price ? `${formData.price}` : '0.00'}
                </div>
                <p className="preview-description">
                  {formData.description || 'Product description will appear here...'}
                </p>
              </div>
              {previewImages.length > 1 && (
                <div className="preview-thumbnails">
                  <h5>Additional Images</h5>
                  <div className="thumbnail-grid">
                    {previewImages.slice(1).map((preview, index) => (
                      <div key={index} className="thumbnail-container">
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 2}`}
                          className="thumbnail-image"
                        />
                        <button
                          type="button"
                          className="remove-thumbnail-btn"
                          onClick={() => removeImage(index + 1)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
