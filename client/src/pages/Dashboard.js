import React from 'react'
import AddProduct from '../components/AddProduct'
import ProductList from '../pages/ProductList'
import Basket from '../components/Basket'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { token, role } = useAuth();
  
  return (
    <div>
      <h1>Dashboard</h1>
      {token && role === "admin" && <AddProduct />}
      {token && role === "user" && <ProductList /> && <Basket />}
    </div>
  )
}
