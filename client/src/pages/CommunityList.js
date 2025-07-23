import React, { useEffect, useState } from 'react';
import { getCommunities } from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../pages/ProductList.css';
import { useAuth } from '../contexts/AuthContext';

const placeholderImg = 'https://ui-avatars.com/api/?name=Store&background=818cf8&color=fff&size=128&rounded=true';

const CommunityList = () => {
  const { role } = useAuth();
  const sellerCommunityId = typeof window !== 'undefined' ? localStorage.getItem('sellerCommunityId') : null;
  const navigate = useNavigate();

  // Seller ise otomatik olarak kendi mağazasına yönlendir
  useEffect(() => {
    if (role === 'seller' && sellerCommunityId) {
      navigate(`/products?communityId=${sellerCommunityId}`);
    }
  }, [role, sellerCommunityId, navigate]);

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const data = await getCommunities();
        setCommunities(data.communities || []);
      } catch (err) {
        setError('Failed to load stores.');
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleSelect = (communityId) => {
    navigate(`/products?communityId=${communityId}`);
  };

  if (loading) return (
    <div className="product-loading-container">
      <div className="product-loading-spinner" />
      <div style={{ marginTop: 12 }}>Loading stores...</div>
    </div>
  );
  if (error) return (
    <div className="product-error-container">
      <div className="product-error-message">{error}</div>
    </div>
  );

  return (
    <div className="product-list-page" style={{ paddingTop: 32 }}>
      <div className="product-grid">
        {communities.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 20 }}>
            No stores found.
          </div>
        )}
        {communities.map((c) => (
          <div
            key={c._id}
            className="product-card community-card"
            style={{
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: 0,
              cursor: 'pointer',
              background: 'rgba(30, 27, 75, 0.85)',
              border: 'none',
              borderRadius: 24,
              boxShadow: '0 8px 32px rgba(129,140,248,0.18)',
              transition: 'transform 0.18s, box-shadow 0.18s',
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => handleSelect(c._id)}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.035)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(129,140,248,0.22)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(129,140,248,0.18)';
            }}
          >
            <div style={{ width: '100%', height: 130, background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <img
                src={c.imageUrl || placeholderImg}
                alt={c.name}
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 16px #23263a55', background: '#23263a', zIndex: 2 }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, rgba(30,27,75,0.0) 60%, rgba(30,27,75,0.18) 100%)',
                zIndex: 1,
              }} />
              {/* Floating action button */}
              <button
                className="icon-btn"
                style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 18,
                  zIndex: 3,
                  background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  fontSize: 20,
                  boxShadow: '0 2px 8px #23263a44',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.18s',
                }}
                tabIndex={-1}
                aria-label="View store"
              >
                <span style={{ display: 'inline-block', transform: 'translateY(1px)' }}>→</span>
              </button>
            </div>
            <div style={{
              width: '100%',
              padding: '22px 18px 16px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(30,27,75,0.55)',
              backdropFilter: 'blur(2px)',
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              minHeight: 120,
            }}>
              <span style={{ fontSize: '1.32rem', fontWeight: 900, color: '#fff', letterSpacing: '0.01em', textShadow: '0 2px 8px #23263a55', marginBottom: 2, textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
              <span style={{ fontSize: '1.01rem', color: '#e0e7ef', background: '#23263a', borderRadius: 8, padding: '2px 12px', fontWeight: 600, marginBottom: 2, marginTop: 2 }}>ID: {c.transId}</span>
              <span style={{ fontSize: '1.01rem', color: '#ede9fe', textAlign: 'center', marginTop: 6, minHeight: 32, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {c.description || 'No description available.'}
              </span>
            </div>
            {/* Show floating button on hover via JS */}
            <script dangerouslySetInnerHTML={{__html:`
              document.querySelectorAll('.community-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                  const btn = card.querySelector('.icon-btn');
                  if(btn) { btn.style.opacity = 1; btn.style.pointerEvents = 'auto'; }
                });
                card.addEventListener('mouseleave', () => {
                  const btn = card.querySelector('.icon-btn');
                  if(btn) { btn.style.opacity = 0; btn.style.pointerEvents = 'none'; }
                });
              });
            `}} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityList; 