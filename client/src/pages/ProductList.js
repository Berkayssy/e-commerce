import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProductList.css";
import { useBasket } from "../contexts/BasketContext";
import Modal from 'react-modal';

// Ensure that react-modal is properly configured
// If you already have it in index.js or App.js, you can remove it from here.
Modal.setAppElement('#root'); 

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [edit, setEdit] = useState({ name: "", description: "", price: "", stock: "", category: "" });
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBasketLoading, setIsBasketLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAdmin = localStorage.getItem("role") === "admin";

  const { basket, addToBasket } = useBasket();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="product-loading-container">
        <div className="product-loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-error-container">
        <p className="product-error-message">{error}</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    try {
      setError(null);
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    }
  };

  const handleEdit = (product) => {
    if (!product) return;
    setEdit({ 
      name: product.name, 
      description: product.description, 
      price: product.price,
      stock: product.stock,
      category: product.category 
    });
    setUpdate(product._id);
  };

  const handleUpdate = async (id) => {
    try {
      setError(null);
      await axios.put(`${process.env.REACT_APP_API_URL}/products/${id}`, edit, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const updated = products.map((p) =>
        p._id === id ? { ...p, ...edit } : p
      );
      setProducts(updated);
      setEdit({ name: "", description: "", price: "", stock: "", category: "" });
      setUpdate(null);
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err.message);
      setError("Failed to update product. Please try again.");
    }
  };

  const handleBasketOperation = async (product) => {
    try {
      setIsBasketLoading(true);
      if (!product || !product._id) {
        throw new Error('Invalid product data');
      }
      await addToBasket(product);
    } catch (error) {
      console.error('Error with basket operation:', error);
      setError('Failed to update basket. Please try again.');
    } finally {
      setIsBasketLoading(false);
    }
  };

  const isInBasket = (productId) => {
    if (!basket || !Array.isArray(basket)) return false;
    return basket.some(item => item && item._id === productId);
  };

  const openModal = (productToView, initialImageIndex = 0) => {
    setSelectedProduct(productToView);
    setCurrentImageIndex(initialImageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const productImagesInModal = selectedProduct?.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : (selectedProduct?.imageUrl ? [selectedProduct.imageUrl] : []);

  const goToNextSlideModal = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % productImagesInModal.length
    );
  };

  const goToPrevSlideModal = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + productImagesInModal.length) % productImagesInModal.length
    );
  };

  return (
    <div className="product-list-page">
      <h1 className="product-list-title">Our Products</h1>
      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p._id}>
            {update === p._id ? (
              <div className="product-edit-mode">
                <input
                  className="product-edit-input"
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  className="product-edit-input"
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                  placeholder="Description"
                />
                <input
                  className="product-edit-input"
                  type="number"
                  value={edit.price}
                  onChange={(e) =>
                    setEdit({ ...edit, price: Number(e.target.value) || 0 })
                  }
                  placeholder="Price"
                />
                <input
                  className="product-edit-input"
                  type="number"
                  value={edit.stock}
                  onChange={(e) =>
                    setEdit({ ...edit, stock: Number(e.target.value) || 0 })
                  }
                  placeholder="Stock"
                />
                <input
                  className="product-edit-input"
                  value={edit.category}
                  onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                  placeholder="Category"
                />
                <button
                  className="product-edit-save-btn"
                  onClick={() => handleUpdate(p._id)}
                  disabled={isBasketLoading}
                >
                  Save
                </button>
                <button
                  className="product-edit-cancel-btn"
                  onClick={() => setUpdate(null)}
                  disabled={isBasketLoading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <img 
                  className="product-image" 
                  src={p.imageUrl || 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=892&hei=820&fmt=jpeg&qlt=90&.v=YnlWZDdpMFo0bUpJZnBpZjhKM2M3VGhTSEZFNjlmT2xUUDNBTjljV1BxWjZkZE52THZKR1lubXJyYmRyWWlhOXZvdUZlR0V0VUdJSjBWaDVNVG95Yk15Y0c3T3Y4UWZwZExHUFdTUC9lN28'}
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/bb3c451c-65f9-41c0-96e7-4ef839717e5d/JR+ZOOM+SUPERFLY+10+ACAD+FGMG.png';
                  }}
                  onClick={() => openModal(p)}
                  style={{ cursor: 'pointer' }}
                />
                <h3 className="product-name">{p.name}</h3>
                <div className="product-description">{p.description}</div>
                <div className="product-price">Price: ${p.price}</div>
                <p className="product-stock">Stock: {p.stock}</p>
                <p className="product-category">Category: {p.category}</p>
                {isAdmin && (
                  <div className="product-admin-actions">
                    <button
                      className="product-action-edit-btn"
                      onClick={() => handleEdit(p)}
                      disabled={isBasketLoading}
                    >
                      Edit
                    </button>
                    <button
                      className="product-action-delete-btn"
                      onClick={() => handleDelete(p._id)}
                      disabled={isBasketLoading}
                    >
                      Delete
                    </button>
                  </div>
                )}
                {!isAdmin && (
                  <div className="product-user-actions">
                    <button
                      className={`add-to-basket-btn ${isInBasket(p._id) ? "in-basket" : ""}`}
                      onClick={() => handleBasketOperation(p)}
                      disabled={isBasketLoading}
                    >
                      {isBasketLoading ? 'Loading...' : isInBasket(p._id) ? 'Remove from basket' : 'Add to basket'}
                    </button>
                    <Link className="product-details-link" to={`/products/${p._id}`}>
                      Go to Details
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="product-image-modal"
        overlayClassName="product-image-overlay"
      >
        <button onClick={closeModal} className="modal-close-btn">X</button>
        {selectedProduct && (
          <>
            <img 
              src={productImagesInModal[currentImageIndex] || '/placeholder-image.png'}
              alt={selectedProduct.name}
              className="modal-image"
            />
            {productImagesInModal.length > 1 && (
              <button className="modal-slider-arrow modal-left-arrow" onClick={goToPrevSlideModal}>←</button>
            )}
            {productImagesInModal.length > 1 && (
              <button className="modal-slider-arrow modal-right-arrow" onClick={goToNextSlideModal}>→</button>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;       