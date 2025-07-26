import React, { useEffect, useState, useRef } from 'react'
import CommunityList from '../pages/CommunityList'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'
import { fetchAdminDashboard } from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useGsapFadeIn from '../components/common/useGsapFadeIn'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import RetryButton from '../components/common/RetryButton'
import SellerOnboarding from '../components/SellerOnboarding';
import axios from 'axios'; // Added axios import
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  const { token, role } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const communityId = params.get('communityId');
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const statCardsRef = useRef([]);
  const chartRef = useRef(null);
  const quickActionsRef = useRef(null);
  const recentActivityRef = useRef(null);

  // Helper functions
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatNumber = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Fetch seller community if needed
  useEffect(() => {
    if (role === "seller" && !communityId) {
      setIsLoadingCommunity(true);
      const fetchSellerCommunity = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/my-community`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          if (response.data.community) {
            window.location.href = `/dashboard?communityId=${response.data.community._id}`;
            return;
          }
        } catch (error) {
          console.error('Error fetching seller community:', error);
        }
        
        // Community bulunamadı, plan durumunu kontrol et
        try {
          const planResponse = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/plan-status`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          if (planResponse.data.isExpired) {
            // Plan bitti, billing sayfasına yönlendir
            window.location.href = '/billing?expired=true';
            return;
          }
        } catch (planError) {
          console.error('Error checking plan status:', planError);
        }
        
        setIsLoadingCommunity(false);
      };
      
      fetchSellerCommunity();
    }
  }, [role, communityId]);

  useEffect(() => {
    if (token && role === "admin") {
      setLoading(true);
      fetchAdminDashboard()
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Dashboard verileri alınamadı');
          setLoading(false);
        });
    }
  }, [token, role]);

  // GSAP animations
  useGsapFadeIn([pageRef, headerRef, statsRef], { 
    stagger: 0.2, 
    duration: 0.6, 
    y: 30 
  });

  useGsapFadeIn(statCardsRef.current, { 
    stagger: 0.1, 
    duration: 0.5, 
    y: 30,
    delay: 0.4 
  });

  useGsapFadeIn(chartRef, { 
    duration: 0.8, 
    y: 20,
    delay: 0.6 
  });

  useGsapFadeIn(quickActionsRef, { 
    duration: 0.8, 
    y: 30,
    delay: 0.4 
  });

  useGsapFadeIn(recentActivityRef, { 
    duration: 0.8, 
    y: 30,
    delay: 0.6 
  });

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (!token) return <div>Giriş yapmalısınız.</div>;

  if (role === "admin") {
    return (
      <div className="dashboard-page" ref={pageRef}>
        <div className="dashboard-container">
          <div className="dashboard-header" ref={headerRef}>
            <h1
              className="dashboard-welcome-title"
              style={{
                fontWeight: 700,
                fontSize: '2.1rem',
                background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
                marginBottom: 8
              }}
            >
              Welcome, {stats?.communityName}!
            </h1>
            <p>Monitor your business performance and analytics</p>
            
            <div className="period-selector">
              {['week', 'month', 'year'].map(period => (
                <button 
                  key={period}
                  className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingSpinner message="Loading dashboard data..." />}
          {error && (
            <div className="dashboard-error">
              <ErrorMessage error={error} />
              <RetryButton onRetry={() => window.location.reload()} />
            </div>
          )}

          {stats && (
            <div className="dashboard-content" ref={statsRef}>
              <div className="stats-grid">
                {[
                  { title: 'Total Sales', value: formatCurrency(stats.totalSales), change: `+${getGrowthRate(stats.totalSales, stats.previousSales)}%`, icon: '📈' },
                  { title: 'Total Orders', value: formatNumber(stats.totalOrders), change: `+${getGrowthRate(stats.totalOrders, stats.previousOrders)}%`, icon: '🛒' },
                  { title: 'Active Users', value: formatNumber(stats.activeUsers), change: `+${getGrowthRate(stats.activeUsers, stats.previousUsers)}%`, icon: '👥' },
                  { title: 'Revenue', value: formatCurrency(stats.revenue), change: `+${getGrowthRate(stats.revenue, stats.previousRevenue)}%`, icon: '💰' }
                ].map((stat, index) => (
                  <div key={stat.title} className="stat-card" ref={el => statCardsRef.current[index] = el}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <h3 className="stat-title">{stat.title}</h3>
                      <p className="stat-value">{stat.value}</p>
                      <span className="stat-change">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="charts-section">
                <div className="chart-card" ref={chartRef}>
                  <h3>Sales Performance</h3>
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(129, 140, 248, 0.1)" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(10, 15, 28, 0.95)', 
                              border: '1px solid rgba(129, 140, 248, 0.2)',
                              borderRadius: '8px',
                              color: '#e2e8f0'
                            }}
                          />
                          <Bar dataKey="sales" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="no-data">
                      <p>No sales data available</p>
                    </div>
                  )}
                </div>

                <div className="chart-card">
                  <h3>Top Products</h3>
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    <ul className="top-products-list">
                      {stats.topProducts.slice(0, 5).map((product, index) => (
                        <li key={product.name} className="top-product-item">
                          <div className="product-rank">#{index + 1}</div>
                          <div className="product-info">
                            <div className="product-name">{product.name}</div>
                            <div className="product-sales">{product.sales} sales</div>
                          </div>
                          <div className="product-revenue">{formatCurrency(product.revenue)}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-data">
                      <p>No product data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="quick-actions" ref={quickActionsRef}>
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  {[
                    { icon: '📦', text: 'Manage Products', href: '/products' },
                    { icon: '📋', text: 'View Orders', href: '/order' },
                    { icon: '👥', text: 'User Management', href: '/users' },
                    { icon: '📊', text: 'Analytics', href: '/analytics' },
                    { icon: '⚙️', text: 'Settings', href: '/settings' },
                    { icon: '💬', text: 'Support', href: '/support' }
                  ].map(action => (
                    <a key={action.text} href={action.href} className="action-btn">
                      <div className="action-icon">{action.icon}</div>
                      <span>{action.text}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="recent-activity" ref={recentActivityRef}>
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {/* Recent activity data would be populated here */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (role === "seller") {
    // Seller için de aynı dashboard'u göster, sadece communityId ile
    if (communityId) {
      return (
        <div className="dashboard-page" ref={pageRef}>
          <div className="dashboard-container">
            <div className="dashboard-header" ref={headerRef}>
              <h1
                className="dashboard-welcome-title"
                style={{
                  fontWeight: 700,
                  fontSize: '2.1rem',
                  background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  marginBottom: 8
                }}
              >
                Welcome to Your Store Dashboard!
              </h1>
              <p>Monitor your business performance and analytics</p>
            </div>

            <div className="dashboard-content" ref={statsRef}>
              <div className="quick-actions" ref={quickActionsRef}>
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  {[
                    { icon: '📦', text: 'Manage Products', href: `/products?communityId=${communityId}` },
                    { icon: '📋', text: 'View Orders', href: `/order?communityId=${communityId}` },
                    { icon: '📊', text: 'Analytics', href: `/analytics?communityId=${communityId}` },
                    { icon: '⚙️', text: 'Seller Panel', href: `/settings?communityId=${communityId}` },
                    { icon: '💬', text: 'Support', href: `/support?communityId=${communityId}` },
                    { icon: '🛡️', text: 'Assign Admin', href: `/assign-admin?communityId=${communityId}` }
                  ].map(action => (
                    <a key={action.text} href={action.href} className="action-btn">
                      <div className="action-icon">{action.icon}</div>
                      <span>{action.text}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // CommunityId yoksa seller'ın kendi community'sini bul
      if (isLoadingCommunity) {
        return (
          <div className="dashboard-page" ref={pageRef}>
            <div className="dashboard-container">
              <div className="dashboard-content">
                <LoadingSpinner message="Loading your store dashboard..." />
              </div>
            </div>
          </div>
        );
      }
      
      // Community bulunamazsa onboarding'e yönlendir
      return <SellerOnboarding />;
    }
  }

  // User Dashboard - sadece user role için
  if (role === "user") {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <CommunityList />
        </div>
      </div>
    );
  }

  // Role yoksa veya loading durumunda
  return (
    <div className="dashboard-page" ref={pageRef}>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <LoadingSpinner message="Loading dashboard..." />
        </div>
      </div>
    </div>
  );
}
