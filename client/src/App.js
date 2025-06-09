import { BrowserRouter as Router, Routes, Route } from 'react-router';
// Nav
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';

// Components
import Login from '../src/components/Login';
import Register from '../src/components/Register';
import Home from '../src/pages/Home';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './components/AdminRoutes';
import Order from './pages/Order';
import MyOrderList from './pages/MyOrderList';
import ProductDetail from './components/ProductDetail';
import Basket from './components/Basket';

import { AuthProvider } from '../src/contexts/AuthContext';
import { BasketProvider } from '../src/contexts/BasketContext';

import { useAuth } from '../src/contexts/AuthContext';

//CSS
import './App.css';


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
        <Route path="/dashoard" element={<AdminRoutes><Dashboard /></AdminRoutes>} />
        <Route path="/order" element={<Order />} />
        <Route path="/my" element={<MyOrderList />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>}/>
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}
function App() {

  return (
    <AuthProvider>
      <BasketProvider>
        <AppContent className="App" />
      </BasketProvider>
    </AuthProvider>
  );
}

export default App;
