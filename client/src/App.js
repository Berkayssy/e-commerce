import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Nav
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';

// Components
import Login from '../src/components/Login';
import Register from '../src/components/Register';
import Home from '../src/pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Order from './pages/Order';
import MyOrderList from './pages/MyOrderList';
import ProductDetail from './components/ProductDetail';
import Basket from './components/Basket';
import AddProduct from './components/AddProduct';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PlanSelection from './pages/PlanSelection';
import PlanDetail from './pages/PlanDetail';

// New Pages
import ProfileSettings from './pages/ProfileSettings';
import BillingPlans from './pages/BillingPlans';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import CommunityList from './pages/CommunityList';
import Contact from './pages/Contact';
import AssignAdmin from './pages/AssignAdmin';

// Admin Pages
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import AdminSettings from './pages/AdminSettings';

import { AuthProvider } from '../src/contexts/AuthContext';
import { BasketProvider } from '../src/contexts/BasketContext';
import { OrderProvider } from '../src/contexts/OrderContext';
import { SearchProvider } from '../src/contexts/SearchContext';

import { useAuth } from '../src/contexts/AuthContext';

//CSS
import './styles/global.css';

import EditProduct from './pages/EditProduct';
import SellerOnboarding from './components/SellerOnboarding';
import ErrorBoundary from './components/common/ErrorBoundary';

function AppContent() {
  const { token } = useAuth();

  return (
    <Router>
      {token && <Navbar />}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/order" element={<Order />} />
        <Route path="/my" element={<MyOrderList />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>}/>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/plans" element={<PlanSelection />} />
        <Route path="/plans/:planId" element={<PlanDetail />} />
        
        {/* New Routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPlans /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/communities" element={<CommunityList />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/assign-admin" element={<ProtectedRoute><AssignAdmin /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/onboarding" element={<SellerOnboarding />} />
        
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <BasketProvider>
        <OrderProvider>
          <SearchProvider>
            <ErrorBoundary>
              <AppContent className="App" />
            </ErrorBoundary>
          </SearchProvider>
        </OrderProvider>
      </BasketProvider>
    </AuthProvider>
  );
}

export default App;
