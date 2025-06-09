import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import { useBasket } from "../contexts/BasketContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToBasket } = useBasket(); // context'ten fonksiyon aldık

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProduct(res.data.product);
      } catch (err) {
        console.error("Error fetching product detail:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ paddingTop: "10%", maxWidth: "600px", margin: "0 auto" }}>
      <Link to="/products" style={{ textDecoration: "none", color: "#ec4899" }}>
        ← Back to Products
      </Link>

      <div style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "2rem",
        marginTop: "1rem",
      }}>
        <h2 style={{ marginBottom: "1rem" }}>{product.name}</h2>
        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Price:</strong> ${product.price}</p>

        <button
          className="login-btn"
          onClick={() => addToBasket(product)}>
          Add to Basket
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;