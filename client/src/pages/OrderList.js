import React, { useEffect, useState } from "react";
import axios from "axios";


const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="order-list">
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-id">Order ID: {order._id}</div>

          <div className="products">
            {order.products.map((p) => (
              <div className="product-item" key={p._id}>
                <span>{p.product.name}</span>
                <span>x{p.quantity}</span>
              </div>
            ))}
          </div>

          <div className="total-price">Total Price: ${order.totalPrice.toFixed(2)}</div>
          <div className="order-date">
            Ordered on: {new Date(order.createdAt).toLocaleDateString()}
          </div>

          <div className={`status ${order.status}`}>
            Status: {order.status}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;