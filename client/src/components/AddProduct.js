import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorMessage from './common/ErrorMessage';
import LoadingSpinner from './common/LoadingSpinner';
import './AddProduct.css';
import gsap from 'gsap';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Remove context-based refs, use local refs instead
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const imagePreviewRef = useRef(null);
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

  // URL'den communityId al
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const communityId = params.get('communityId');
    if (!communityId) {
      navigate('/communities');
    }
  }, [location, navigate]);

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    let timeout;
    if (success) {
      const params = new URLSearchParams(location.search);
      const communityId = params.get('communityId');
      timeout = setTimeout(() => {
        navigate(`/products?communityId=${communityId}`);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [success, navigate, location.search]);

  useEffect(() => {
    const pageNode = pageRef.current;
    const formNode = formRef.current;
    const imagePreviewNode = imagePreviewRef.current;
    return () => {
      if (pageNode && pageNode.parentNode) gsap.killTweensOf(pageNode);
      if (formNode && formNode.parentNode) gsap.killTweensOf(formNode);
      if (imagePreviewNode && imagePreviewNode.parentNode) gsap.killTweensOf(imagePreviewNode);
    };
  }, []);

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
    // Create preview URLs with unique id
    const newPreviews = files.map(file => ({
      id: generateId(),
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
    const newPreviews = files.map(file => ({ id: generateId(), file, preview: URL.createObjectURL(file) }));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const removeImage = (id) => {
    const idx = previewImages.findIndex(img => img.id === id);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewImages(prev => {
      const removed = prev[idx];
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    // Adjust main image index
    if (mainImageIndex === idx) {
      setMainImageIndex(0);
    } else if (mainImageIndex > idx) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(location.search);
      const communityId = params.get('communityId');
      if (!communityId) {
        setError('Topluluk seçilmeden ürün eklenemez.');
        setLoading(false);
        return;
      }
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('communityId', communityId);
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      await axios.post(`${process.env.REACT_APP_API_URL}/products`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
      // setTimeout kaldırıldı, yönlendirme useEffect ile yapılacak
    } catch (err) {
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
    <div className="page-container" ref={pageRef} style={{
      minHeight: '100vh',
      background: '#0a0f1c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: '32px 0 0 0',
      width: '100%',
    }}>
      {/* Fragment ile üç ana yapıyı sar */}
      <>
        <div className="add-product-header" style={{
          width: '100%',
          maxWidth: 1400,
          margin: '0 auto 0 auto',
          padding: '0 18px',
        }}>
          <h1 className="page-title" style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
            marginBottom: 4,
            textAlign: 'center',
          }}>Add New Product</h1>
          <p className="page-subtitle" style={{
            color: '#cbd5e1',
            fontSize: '0.98rem',
            fontWeight: 500,
            marginBottom: 18,
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}>Create a new product for your store</p>
        </div>
        <div className="add-product-flex" style={{
          display: 'flex',
          gap: 36,
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 18px',
          justifyContent: 'center',
        }}>
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="add-product-form" ref={formRef} style={{
            flex: 1,
            background: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            minWidth: 340,
            maxWidth: 480,
          }}>
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
                      key={preview.id} 
                      className={`selected-image-thumb${mainImageIndex === idx ? ' main-thumb' : ''}`}
                      onClick={() => setMainImageIndex(idx)}
                    >
                      <img src={preview.preview} alt={`Selected ${idx + 1}`} />
                      <button 
                        type="button" 
                        className="remove-thumbnail-btn" 
                        onClick={(e) => { e.stopPropagation(); removeImage(preview.id); }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-row" style={{display:'flex',gap:18,marginTop:8,alignItems:'center'}}>
              <div className="form-group" style={{flex:1,minWidth:100}}>
                <label htmlFor="price" className="form-label">Price ($)</label>
                {renderFormField(formFields[2])}
              </div>
              <div className="form-group" style={{flex:1,minWidth:120}}>
                <label htmlFor="category" className="form-label">Category</label>
                {renderFormField(formFields[4])}
              </div>
              <div className="form-group" style={{flex:1,minWidth:120}}>
                <label htmlFor="brand" className="form-label">Brand</label>
                {renderFormField(formFields[5])}
              </div>
              <div className="form-group" style={{flex:1,minWidth:100}}>
                <label htmlFor="stock" className="form-label">Stock</label>
                {renderFormField(formFields[3])}
              </div>
            </div>
            <div className="form-actions" style={{
              display:'flex',
              gap:18,
              marginTop:32,
              justifyContent:'center',
              alignItems:'center',
              width:'100%'
            }}>
              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={loading}
                style={{
                  fontSize: '1.08rem',
                  padding: '12px 38px',
                  minHeight: 48,
                  minWidth: 160,
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: '0 0 8px 1px #c084fc33, 0 1px 4px #818cf822',
                  letterSpacing: '-0.01em',
                  transition: 'box-shadow 0.18s, background 0.18s',
                }}
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
                onClick={handleClear}
                className="btn clear-btn"
                disabled={loading}
                style={{
                  fontSize: '1.08rem',
                  padding: '12px 38px',
                  minHeight: 48,
                  minWidth: 140,
                  borderRadius: 12,
                  background: '#181a20',
                  color: '#f472b6',
                  fontWeight: 700,
                  border: '1.2px solid #23263a',
                  boxShadow: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s',
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn cancel-btn"
                disabled={loading}
                style={{
                  fontSize: '1.08rem',
                  padding: '12px 38px',
                  minHeight: 48,
                  minWidth: 140,
                  borderRadius: 12,
                  background: '#181a20',
                  color: '#818cf8',
                  fontWeight: 700,
                  border: '1.2px solid #23263a',
                  boxShadow: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s',
                }}
              >
                Cancel
              </button>
            </div>
            <ErrorMessage error={error} />
            {success && (
              <div className="success-message" style={{
                marginTop: 12,
                fontWeight: 700,
                fontSize: '1.08rem',
                background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}>
                Product added successfully! Redirecting...
              </div>
            )}
          </form>
          {/* Preview Section */}
          <div ref={imagePreviewRef}>
            <h3 className="preview-title" style={{
              fontSize: '1.18rem',
              fontWeight: 800,
              color: '#b4b8ff',
              marginBottom: 16,
              letterSpacing: '-0.01em',
              textAlign: 'left',
              paddingLeft: 8,
            }}>Product Preview</h3>
            <div className="preview-content" style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: 18,
              padding: '2.2rem 2.2rem',
              borderRadius: 18,
              border: '1.5px solid',
              borderImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%) 1',
              fontSize: '1rem',
              color: '#e2e8f0',
              margin: 0,
              maxWidth: 420,
            }}>
              <div className="preview-image-container" style={{width:'100%',aspectRatio:'4/3',borderRadius:16,overflow:'hidden',background:'#23263a',display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid #818cf8',marginBottom:18}}>
                {previewImages.length > 0 ? (
                  <img
                    src={previewImages[mainImageIndex]?.preview}
                    alt="Product preview"
                    className="preview-main-image"
                    style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:16}}
                  />
                ) : (
                  <div className="preview-placeholder" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#a5b4fc',gap:'0.5rem',width:'100%',height:'100%'}}>
                    <span style={{fontSize:'2.5rem',opacity:0.5}}>🖼️</span>
                    <p style={{fontSize:'0.95rem',margin:0}}>No images selected</p>
                  </div>
                )}
              </div>
              <div className="preview-details" style={{display:'flex',flexDirection:'column',gap:'0.7rem',color:'#cbd5e1',width:'100%'}}>
                <h4 className="preview-name" style={{fontSize:'1.13rem',fontWeight:700,color:'#e2e8f0',margin:0,lineHeight:1.3}}>{formData.name || 'Product Name'}</h4>
                <div className="preview-meta" style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap',fontSize:'0.95rem'}}>
                  <span className="preview-category" style={{background:'rgba(129,140,248,0.13)',color:'#818cf8',padding:'0.3rem 0.7rem',borderRadius:8,fontSize:'0.85rem',fontWeight:600,border:'1px solid rgba(129,140,248,0.18)'}}>{formData.category || 'Category'}</span>
                  <span className="preview-stock" style={{background:'rgba(190,24,93,0.13)',color:'#be185d',padding:'0.3rem 0.7rem',borderRadius:8,fontSize:'0.85rem',fontWeight:600,border:'1px solid rgba(190,24,93,0.18)'}}>Stock: {formData.stock || '0'}</span>
                </div>
                <div className="preview-price price price-lg" style={{margin:0,fontSize:'1.13rem',fontWeight:700,color:'#f472b6'}}>{formData.price ? `$${formData.price}` : '0.00'}</div>
                <p className="preview-description" style={{color:'#a5b4fc',fontSize:'0.98rem',lineHeight:1.5,margin:0,opacity:0.93}}>{formData.description || 'Product description will appear here...'}</p>
              </div>
              {previewImages.length > 1 && (
                <div className="preview-thumbnails" style={{borderTop:'1px solid #23263a',paddingTop:'1.2rem',width:'100%'}}>
                  <h5 style={{fontSize:'0.95rem',fontWeight:700,color:'#818cf8',margin:'0 0 0.7rem 0'}}>Additional Images</h5>
                  <div className="thumbnail-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(48px, 1fr))',gap:'0.4rem'}}>
                    {previewImages.slice(1).map((preview, index) => (
                      <div key={preview.id} className="thumbnail-container" style={{position:'relative',width:48,height:48,aspectRatio:1,borderRadius:6,overflow:'hidden',border:'1px solid #23263a',background:'#23263a',boxShadow:'0 1px 4px rgba(16,22,36,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 2}`}
                          className="thumbnail-image"
                          style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,display:'block'}}
                        />
                        <button
                          type="button"
                          className="remove-thumbnail-btn"
                          style={{position:'absolute',top:2,right:2,width:16,height:16,borderRadius:'50%',background:'linear-gradient(90deg,#ef4444 0%,#be185d 100%)',color:'#fff',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'0.7rem',fontWeight:700,transition:'all 0.3s',zIndex:2,boxShadow:'0 1px 4px rgba(239,68,68,0.13)'}}
                          onClick={() => removeImage(preview.id)}
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
      </>
    </div>
  );
};

export default AddProduct;
