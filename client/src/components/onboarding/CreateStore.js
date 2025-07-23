import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import './CreateStore.css';

const CreateStore = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogo(null);
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Please enter your store name.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const sellerId = localStorage.getItem('sellerId');
      const planId = localStorage.getItem('selectedPlanId');
      if (!token || !sellerId || !planId) {
        setError('Plan or seller info missing. Please select a plan again.');
        setLoading(false);
        window.location.href = '/plans';
        return;
      }
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('owner', sellerId);
      formData.append('plan', planId);
      if (logo) formData.append('logo', logo);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/onboarding/create-store`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setLoading(false);
      const newCommunityId = response.data.community?._id;
      // Auth bilgilerini kaydet (yönlendirme öncesi)
      if (response.data.user && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Eğer AuthContext'ten setToken, setRole, setUser fonksiyonları alınabiliyorsa burada çağırabilirsin
      }
      if (newCommunityId) {
        window.location.href = `/products?communityId=${newCommunityId}`;
      } else {
        onSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create store.');
    }
  };

  return (
    <div className="create-store-container">
      {/* Only show diamond if no logo preview */}
      {!logoPreview && (
        <div className="create-store-icon">
          {/* Luxury diamond SVG */}
          <svg viewBox="0 0 32 32" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="diamondGradCreateStore" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f7c873" />
                <stop offset="0.5" stopColor="#c084fc" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondGradCreateStore)" stroke="#fff" strokeWidth="1.2" />
            <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
          </svg>
        </div>
      )}
      {logoPreview && (
        <div className="create-store-logo-preview" style={{marginBottom:10}}>
          <img src={logoPreview} alt="Logo Preview" className="create-store-logo-img" style={{width:54,height:54}} />
        </div>
      )}
      <div className="create-store-title" style={{marginBottom:6}}>Open Your Luxury Store</div>
      <div className="create-store-desc" style={{marginBottom:18}}>Welcome to Galeria. Create your exclusive store and start selling with elegance.</div>
      <form className="create-store-form" onSubmit={handleSubmit} style={{gap:12}}>
        <div className="create-store-field" style={{marginBottom:8}}>
          <input
            type="text"
            name="name"
            className="create-store-input"
            placeholder="Store Name (e.g. Diamond Atelier)"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
            style={{minHeight:36,maxHeight:44,padding:'10px 12px',fontSize:'1rem'}}
          />
        </div>
        <div className="create-store-field" style={{marginBottom:8}}>
          <textarea
            name="description"
            className="create-store-input create-store-textarea"
            placeholder="Store Description (What makes your store special?)"
            value={form.description}
            onChange={handleChange}
            rows={2}
            maxLength={200}
            style={{resize:'none',minHeight:36,maxHeight:60,padding:'10px 12px',fontSize:'1rem'}}
          />
        </div>
        <div className="create-store-field" style={{marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
          <label className="create-store-label" style={{marginBottom:2,fontSize:'0.97rem',flex:'0 0 120px'}}>Store Logo (optional)</label>
          <label htmlFor="store-logo-upload" className="create-store-file-label">Choose File</label>
          <input
            id="store-logo-upload"
            type="file"
            accept="image/*"
            className="create-store-file"
            onChange={handleLogoChange}
          />
          <span className="create-store-file-name">{logo ? logo.name : 'No file chosen'}</span>
        </div>
        {error && <div className="create-store-error">{error}</div>}
        <button type="submit" className="create-store-btn" disabled={loading} style={{padding:'12px 0',fontSize:'1.08rem',minHeight:44,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'auto'}}>
            {/* Lock icon for trust */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight:2,marginBottom:0,display:'inline-block',verticalAlign:'middle'}}>
              <rect x="4" y="8" width="12" height="8" rx="2.5" fill="#fff" fillOpacity="0.13" stroke="#f7c873" strokeWidth="1.2"/>
              <path d="M7 8V6.5C7 4.567 8.567 3 10.5 3C12.433 3 14 4.567 14 6.5V8" stroke="#f7c873" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="10.5" cy="12.5" r="1.2" fill="#f7c873"/>
            </svg>
            {loading ? <LoadingSpinner message="Creating store..." /> : 'Create Store'}
          </span>
        </button>
        <div className="create-store-helper" style={{marginTop:10,fontSize:'0.93rem'}}>You can change your store details later from your profile settings.</div>
      </form>
    </div>
  );
};

export default CreateStore; 