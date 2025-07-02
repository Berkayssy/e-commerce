import React, { useRef, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import './Analytics.css';

const Analytics = () => {
  const pageRef = useRef(null);
  const statsRef = useRef([]);
  const chartRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for charts
  const salesData = [
    { name: 'Jan', sales: 4000, orders: 2400, revenue: 2400 },
    { name: 'Feb', sales: 3000, orders: 1398, revenue: 2210 },
    { name: 'Mar', sales: 2000, orders: 9800, revenue: 2290 },
    { name: 'Apr', sales: 2780, orders: 3908, revenue: 2000 },
    { name: 'May', sales: 1890, orders: 4800, revenue: 2181 },
    { name: 'Jun', sales: 2390, orders: 3800, revenue: 2500 },
    { name: 'Jul', sales: 3490, orders: 4300, revenue: 2100 },
  ];

  const categoryData = [
    { name: 'Luxury Car', value: 35, color: '#818cf8' },
    { name: 'Sport Car', value: 30, color: '#c084fc' },
    { name: 'Classic Car', value: 25, color: '#f472b6' },
    { name: 'Other', value: 10, color: '#fbbf24' },
  ];

  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#fbbf24'];

  // GSAP animations
  useGsapFadeIn(pageRef, { duration: 0.8, y: 30 });
  useGsapFadeIn(statsRef.current, { 
    stagger: 0.1, 
    duration: 0.8, 
    y: 50,
    delay: 0.2 
  });
  useGsapFadeIn(chartRef, { 
    duration: 1, 
    y: 20,
    delay: 0.4 
  });

  const stats = [
    { title: 'Total Sales', value: '$124,567', change: '+12.5%', icon: '📈' },
    { title: 'Total Orders', value: '1,234', change: '+8.2%', icon: '🛒' },
    { title: 'Active Users', value: '892', change: '+15.3%', icon: '👥' },
    { title: 'Revenue', value: '$89,432', change: '+22.1%', icon: '💰' },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(10, 15, 28, 0.95)', 
    border: '1px solid rgba(129, 140, 248, 0.2)',
    borderRadius: '8px',
    color: '#e2e8f0'
  };

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Track your business performance and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid grid grid-auto-fit">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card card"
              ref={el => statsRef.current[index] = el}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change positive">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          {['overview', 'sales', 'categories'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-container" ref={chartRef}>
          {activeTab === 'overview' && (
            <div className="chart-grid grid grid-2">
              <div className="chart-card card">
                <h3 className="chart-title">Sales Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(129, 140, 248, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#818cf8" 
                      fill="rgba(129, 140, 248, 0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3 className="chart-title">Orders Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(129, 140, 248, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#c084fc" 
                      strokeWidth={3}
                      dot={{ fill: '#c084fc', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="chart-card card full-width">
              <h3 className="chart-title">Revenue Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(129, 140, 248, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="#f472b6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="chart-card card full-width">
              <h3 className="chart-title">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 