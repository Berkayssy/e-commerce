import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommunities, getProductsByCommunity } from '../api/api';
import AddProduct from './AddProduct';
import LoadingSpinner from './common/LoadingSpinner';
import CreateStore from './onboarding/CreateStore';
import './SellerOnboarding.css';

const SellerOnboarding = () => {
  const [step, setStep] = useState('loading'); // 'loading', 'create-store', 'add-product', 'dashboard'
  const [communityId, setCommunityId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const sellerId = localStorage.getItem('sellerId');
    if (!token || !sellerId) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setStep('loading');
      try {
        // 1. Kullanıcının sahip olduğu community'yi bul
        const data = await getCommunities();
        const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
        const myCommunity = (data.communities || []).find(c => c.owner === userId);
        if (!myCommunity) {
          setStep('create-store');
          return;
        }
        setCommunityId(myCommunity._id);
        if (myCommunity.name) localStorage.setItem('sellerCommunityName', myCommunity.name);
        // 2. Community'nin ürünü var mı kontrol et
        const prodData = await getProductsByCommunity(myCommunity._id);
        if ((prodData.products || []).length === 0) {
          setStep('add-product');
        } else {
          setStep('dashboard');
        }
      } catch (err) {
        setStep('create-store');
      }
    };
    fetchData();
  }, []); // Sadece ilk mount'ta çalışır

  // Eğer seller'ın communityId'si varsa ve step 'add-product' ise, otomatik olarak products'a yönlendir
  useEffect(() => {
    if (step === 'add-product' && communityId) {
      navigate(`/products?communityId=${communityId}`);
    }
  }, [step, communityId, navigate]);

  if (step === 'loading') return <LoadingSpinner message="Loading your seller dashboard..." />;
  if (step === 'create-store') {
    return <CreateStore onSuccess={async () => {
      // Mağaza oluşturulduktan sonra seller'ın community'sini tekrar çek
      const data = await getCommunities();
      const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
      const myCommunity = (data.communities || []).find(c => c.owner === userId);
      if (myCommunity && myCommunity._id) {
        setCommunityId(myCommunity._id);
        if (myCommunity.logo && myCommunity.logo.url) {
          localStorage.setItem('sellerCommunityLogo', myCommunity.logo.url);
        }
        setStep('add-product');
      } else {
        setStep('create-store');
      }
    }} />;
  }
  if (step === 'add-product') {
    return (
      <div className="onboarding-home-container">
        <div className="onboarding-home-card">
          <div className="onboarding-home-icon">
            {/* Luxury diamond SVG */}
            <svg viewBox="0 0 32 32" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="diamondGradOnboarding" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f7c873" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondGradOnboarding)" stroke="#fff" strokeWidth="1.2" />
              <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
            </svg>
          </div>
          <div className="onboarding-home-welcome">Welcome, Seller!</div>
          <h2 className="onboarding-home-title">Add Your First Product</h2>
          <p className="onboarding-home-desc">Your store is ready. Add your first product to start selling on Galeria.</p>
          <div className="onboarding-home-addproduct">
            <AddProduct communityId={communityId} />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default SellerOnboarding; 