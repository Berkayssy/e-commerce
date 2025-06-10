import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function MyOrderList() {
    const [ myOrders, setMyOrders ] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMyOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);
    if (loading) return <p>Loading...</p>;

    if (myOrders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="order-list">
      {myOrders.map((orders) => (
        <div key={orders._id} className="order-card">
          <div className="order-id">Order ID: {orders._id}</div>

          <div className="products">
            {orders.products.map((p) => (
              <div className="product-item" key={p._id}>
                <span>{p.product.name}</span>
                <span>x{p.quantity}</span>
              </div>
            ))}
          </div>

          <div className="total-price">Total Price: ${orders.totalPrice.toFixed(2)}</div>
          <div className="order-date">
            Ordered on: {new Date(orders.createdAt).toLocaleDateString()}
          </div>

          <div className={`status ${orders.status}`}>
            Status: {orders.status}
          </div>
        </div>
      ))}
    </div>
  )
}
