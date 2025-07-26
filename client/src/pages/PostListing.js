import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PostListing.css';

const PostListing = () => {
  const navigate = useNavigate();
  const { sellerId: urlSellerId } = useParams();
  
  console.log('🚀 PostListing component rendered');
  console.log('📋 urlSellerId from params:', urlSellerId);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    images: [],
    contactInfo: {
      phone: '',
      email: '',
      location: ''
    }
  });
  
  const pageRef = useRef(null);
  const formRef = useRef(null);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ No token, redirecting to login');
          handleNavigate('/login');
          return;
        }

        // Get seller profile
        console.log('📡 Fetching seller profile...');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('👤 Seller profile response:', response.data);

        // Check if the current user is a seller
        console.log('🔍 Checking user role:', response.data.userId?.role);
        if (response.data.userId?.role !== 'seller') {
          console.log('❌ User is not a seller, redirecting to dashboard');
          handleNavigate('/dashboard');
          return;
        }

        // Get seller ID from token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentSellerId = tokenPayload.sellerId;
        console.log('🔐 Current sellerId from token:', currentSellerId);
        console.log('🎯 URL sellerId:', urlSellerId);

        // Validate seller access - check if URL sellerId matches token sellerId
        console.log('🔍 Validation check - currentSellerId exists:', !!currentSellerId);
        console.log('🔍 Validation check - urlSellerId exists:', !!urlSellerId);
        console.log('🔍 Validation check - IDs match:', currentSellerId === urlSellerId);
        
        if (!currentSellerId || (urlSellerId && currentSellerId !== urlSellerId)) {
          console.log('❌ Seller ID mismatch, redirecting to dashboard');
          console.log('❌ Reason: currentSellerId missing or IDs do not match');
          handleNavigate('/dashboard');
          return;
        }

        console.log('✅ Seller validation passed, setting form data');
        
        // Store seller's community ID for navigation
        if (response.data.storeId && response.data.storeId._id) {
          localStorage.setItem('sellerCommunityId', response.data.storeId._id);
          console.log('💾 Stored seller community ID:', response.data.storeId._id);
        }
        
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            phone: response.data.phone || '',
            email: response.data.userId?.email || '',
            location: `${response.data.city}, ${response.data.country}` || ''
          }
        }));
      } catch (err) {
        console.error('❌ Error fetching seller data:', err);
        setError('Failed to load seller data');
        handleNavigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [urlSellerId, handleNavigate]);

  // GSAP animations
  useGsapFadeIn([pageRef, formRef], { 
    stagger: 0.2, 
    duration: 0.6, 
    y: 30 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', 1); // Default stock

      // Add images
      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/products`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Listing posted successfully!');
      setTimeout(async () => {
        // Get seller's community and navigate to products page
        const token = localStorage.getItem('token');
        const sellerCommunityId = localStorage.getItem('sellerCommunityId');
        
        if (sellerCommunityId) {
          console.log('🎯 Navigating to seller products with communityId:', sellerCommunityId);
          handleNavigate(`/products?communityId=${sellerCommunityId}`);
        } else if (token) {
          try {
            const communityResponse = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/my-community`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (communityResponse.data.community) {
              handleNavigate(`/products?communityId=${communityResponse.data.community._id}`);
            } else {
              handleNavigate('/products');
            }
          } catch (err) {
            handleNavigate('/products');
          }
        } else {
          handleNavigate('/products');
        }
      }, 2000);
    } catch (err) {
      console.error('Error posting listing:', err);
      setError(err.response?.data?.error || 'Failed to post listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading seller data..." />;
  }

  return (
    <div className="post-listing-page" ref={pageRef}>
      <div className="post-listing-container">
        <div className="post-listing-header">
          <h1>Create New Listing</h1>
          <p>Post your advertisement to reach potential customers</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-listing-form" ref={formRef}>
          <div className="form-section">
            <h3>📢 Listing Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Listing Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your listing title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product or service"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>📸 Images</h3>
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="file-input"
              />
              <p className="help-text">Upload up to 10 images (JPG, PNG)</p>
            </div>

            {formData.images.length > 0 && (
              <div className="image-preview">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>📞 Contact Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactInfo.phone">Phone</label>
                <input
                  type="tel"
                  id="contactInfo.phone"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactInfo.email">Email</label>
                <input
                  type="email"
                  id="contactInfo.email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactInfo.location">Location</label>
              <input
                type="text"
                id="contactInfo.location"
                name="contactInfo.location"
                value={formData.contactInfo.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Posting...' : '📢 Post Listing'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => {
              const sellerCommunityId = localStorage.getItem('sellerCommunityId');
              if (sellerCommunityId) {
                handleNavigate(`/products?communityId=${sellerCommunityId}`);
              } else {
                handleNavigate('/products');
              }
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostListing; 