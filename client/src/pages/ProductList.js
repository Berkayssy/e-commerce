import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";

import { useBasket } from "../contexts/BasketContext";



const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [edit, setEdit] = useState({name: "", description: "", price: ""});
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = localStorage.getItem("role") === "admin";

  const {basket, addToBasket} = useBasket();

  useEffect(() => {
    const fetchProducts = async () => {
        try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setProducts(res.data.products);
        } catch (err) {
        console.error("Error fething products:", err);
        } finally {
        setLoading(false);
        }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading...</p>;

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleEdit = (product) => {
    setEdit({ name: product.name, description: product.description });
    setUpdate(product._id);
  };

  const handleUpdate = async(id) => {
    try {
        await axios.put(`http://localhost:4000/api/products/${id}`, edit, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const updated = products.map((p) => 
            p._id === id ? { ...p, ...edit } : p
        );
        setProducts(updated);
        setEdit({ name: "", description: "", price: "" });
    } catch (err) {
        console.error("Error updating product:", err.response?.data || err.message);
    }
  }

  return (
    <div className="order-list">
      {products.map((p) => (
        <div className="order-card" key={p._id}>
          {update === p._id ? (
            <div className="edit-mode">
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder="Name"
              />
              <input
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                placeholder="Description"
              />
              <input
                type="number"
                value={edit.price}
                onChange={(e) =>
                  setEdit({ ...edit, price: Number(e.target.value) || 0 })
                }
                placeholder="Price"
              />
              <button className="login-btn" onClick={() => handleUpdate(p._id)}>Save</button>
              <button className="login-btn" onClick={() => setUpdate(null)}>Cancel</button>
            </div>
          ) : (
            <div className="edit-mode">
              <p>{p.name}</p>
              <p>{p.description}</p>
              <p>Price: ${p.price}</p>
              {isAdmin && <button className="login-btn" onClick={() => {
                setUpdate(p._id);
                setEdit({
                  name: p.name,
                  description: p.description,
                  price: p.price,
                });
                handleEdit && handleEdit(p); // Optional: Call the handleEdit function
              }}>Edit</button>}
              {isAdmin && <button className="login-btn" onClick={() => handleDelete(p._id)}>Delete</button>}
            </div>
          )}
          <>
            {!isAdmin && <button className="login-btn" style={{backgroundColor: basket.find((item) => item._id === p._id) ? "#be185d" : "#ec4899"}} onClick={() => addToBasket(p)}>{basket.find((item) => item._id === p._id) ? 'Remove from basket' : 'Add to basket'}</button>}
            <br />
            <br />
            {!isAdmin ? <Link style={{ color: "#ec4899" }} to={`/products/${p._id}`}>Go to Details</Link> : null}
          </>
        </div>
      ))}
    </div>
  );
};

export default ProductList;       