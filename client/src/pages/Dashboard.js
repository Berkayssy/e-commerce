import React, { useEffect, useState } from 'react'
import AddProduct from '../components/AddProduct'
import ProductList from '../pages/ProductList'
import Basket from '../components/Basket'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'
import { fetchAdminDashboard } from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'

export default function Dashboard() {
  const { token, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper for formatting numbers with thousands separators (global, USD)
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

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

  if (!token) return <div>Giriş yapmalısınız.</div>;

  if (role === "admin") {
    return (
      <div className="dashboard-container">
        <h2 className='dashboard-title'>Admin Dashboard</h2>
        {loading && <div>Yükleniyor...</div>}
        {error && <div className="error">{error}</div>}
        {stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Best Selling Products</h3>
              {stats.topProducts && stats.topProducts.length > 0 ? (
                <ul>
                  {stats.topProducts.map((prod) => (
                    <li key={prod.productId}>{prod.name} ({prod.totalSold} x)</li>
                  ))}
                </ul>
              ) : (
                <p>Veri yok</p>
              )}
            </div>
            <div className="stat-card chart-card">
              <h3>Best Sellers Chart</h3>
              {stats.topProducts && stats.topProducts.length > 0 ? (
                <div style={{ width: '100%', height: 250, marginTop: 16 }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.topProducts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={80} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="totalSold" fill="#6366f1" radius={[8, 8, 0, 0]}>
                        <LabelList dataKey="totalSold" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>No data found for chart</p>
              )}
            </div>
          </div>
        )}
        <AddProduct/>
      </div>
    );
  }

  // User Dashboard
  return (
    <div className="dashboard-container">
      {token && role === "user" && (
        <div className="dashboard-content">
          <div className="product-section">
            <ProductList />
          </div>
          <div className="basket-section">
            <Basket />
          </div>
        </div>
      )}
    </div>
  )
}
