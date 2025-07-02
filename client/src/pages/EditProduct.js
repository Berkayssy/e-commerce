import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Görsel yönetimi
  const [images, setImages] = useState([]); // { url, file, isNew }
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const fileInputRef = useRef();

  const categoryOptions = [
    'Luxury', 'Sport', 'Classic', 'Off-Road', 'Electric', 'Hybrid', 'Supercar', 'Convertible', 'Coupe', 'Other'
  ];
  const brandOptions = [
    'Mercedes', 'BMW', 'Maserati', 'Ferrari', 'Porsche', 'Audi', 
    'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 
    'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg', 'Chevrolet', 'Generic'
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct({
          ...res.data.product,
          brand: res.data.product.brand || 'Generic',
        });
        // Tüm varyasyonları destekle
        let imgs = [];
        if (res.data.product.images && Array.isArray(res.data.product.images) && res.data.product.images.length > 0) {
          imgs = res.data.product.images.map(url => ({ url, isNew: false }));
        } else if (res.data.product.imageUrl) {
          imgs = [{ url: res.data.product.imageUrl, isNew: false }];
        }
        setImages(imgs);
        setMainImageIdx(0);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true
    }));
    setImages(prev => [...prev, ...newImgs]);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (mainImageIdx >= idx && mainImageIdx > 0) setMainImageIdx(mainImageIdx - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('category', product.category);
      formData.append('price', product.price);
      formData.append('description', product.description);
      formData.append('stock', product.stock);
      // Sadece yeni eklenen dosyaları ekle
      images.forEach(img => {
        if (img.isNew && img.file) formData.append('images', img.file);
      });
      // Kalan eski görsellerin url'lerini ekle
      const existingImages = images.filter(img => !img.isNew).map(img => img.url);
      formData.append('existingImages', JSON.stringify(existingImages));
      // Silinen eski görselleri backend'e iletmek için (opsiyonel, backend'e göre)
      const originalUrls = (product.images && Array.isArray(product.images)) ? product.images : (product.imageUrl ? [product.imageUrl] : []);
      const removedUrls = originalUrls.filter(url => !images.some(img => img.url === url));
      if (removedUrls.length > 0) {
        removedUrls.forEach(url => formData.append('removeImages', url));
      }
      await axios.put(`${process.env.REACT_APP_API_URL}/products/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } }
      );
      navigate('/products');
    } catch (err) {
      setError('Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="editpage-center">
      <div className="editpage-spinner"></div>
      <span>Loading...</span>
    </div>
  );
  if (error) return <div className="editpage-center error">{error}</div>;
  if (!product) return null;

  // Galeri fallback
  const galleryImages = images.length > 0 ? images : [{ url: '/placeholder-image.png', isNew: false }];

  return (
    <div className="editpage-wrapper">
      <div className="editpage-container">
        <h2 className="editpage-title">Edit Product</h2>
        <form className="editpage-form" onSubmit={handleSubmit}>
          <div className="editpage-grid">
            {/* Sol: Görsel galeri */}
            <div className="editpage-image-section">
              <div className="editpage-main-image-box">
                <img
                  src={galleryImages[mainImageIdx]?.url}
                  alt="Main"
                  className="editpage-main-image"
                  onError={e => { e.target.src = '/placeholder-image.png'; }}
                />
              </div>
              <div className="editpage-thumbnails-row">
                {galleryImages.map((img, idx) => (
                  <div className={`editpage-thumb${idx === mainImageIdx ? ' active' : ''}`} key={idx}>
                    <img
                      src={img.url}
                      alt={`Thumb ${idx + 1}`}
                      onClick={() => setMainImageIdx(idx)}
                    />
                    {images.length > 0 && (
                      <button type="button" className="editpage-remove-img" onClick={() => handleRemoveImage(idx)}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="editpage-add-img-btn" onClick={() => fileInputRef.current.click()}>Add Image</button>
              <input type="file" accept="image/*" multiple onChange={handleAddImages} className="editpage-file" ref={fileInputRef} style={{ display: 'none' }} />
            </div>
            {/* Sağ: Form alanları */}
            <div className="editpage-fields-section">
              <div className="editpage-row">
                <label>Name</label>
                <input name="name" value={product.name || ''} onChange={handleChange} required />
              </div>
              <div className="editpage-row">
                <label>Category</label>
                <select name="category" value={product.category || ''} onChange={handleChange} required>
                  <option value="" disabled>Select category</option>
                  {categoryOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="editpage-row">
                <label>Brand</label>
                <select name="brand" value={product.brand || ''} onChange={handleChange} required>
                  <option value="" disabled>Select brand</option>
                  {brandOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="editpage-row">
                <label>Price</label>
                <input name="price" type="number" value={product.price || ''} onChange={handleChange} required />
              </div>
              <div className="editpage-row">
                <label>Description</label>
                <textarea name="description" value={product.description || ''} onChange={handleChange} required />
              </div>
              <div className="editpage-row">
                <label>Stock</label>
                <input name="stock" type="number" value={product.stock || ''} onChange={handleChange} required />
              </div>
              <div className="editpage-actions">
                <button type="button" onClick={() => navigate(-1)} className="editpage-btn">Back</button>
                <button type="submit" disabled={saving} className="editpage-btn prominent">{saving ? 'Updating...' : 'Update Product'}</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct; 