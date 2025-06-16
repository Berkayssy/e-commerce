import React from 'react'
import AddProduct from '../components/AddProduct'
import ProductList from '../pages/ProductList'
import Basket from '../components/Basket'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { token, role } = useAuth();
  
  return (
    <div className="dashboard-container">
      {token && role === "admin" && <AddProduct />}
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
