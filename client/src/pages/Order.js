import React from 'react'
import OrderList from './OrderList'
import MyOrderList from './MyOrderList'
import { useAuth } from '../contexts/AuthContext'

export default function Order() {
  const { token, role } = useAuth();

  return (
    <div>
      {token && (role === "admin" || role === "seller") ? (<OrderList />) : null}
      {token && role === "user" ? (<MyOrderList />) : null}
    </div>
  )
}
