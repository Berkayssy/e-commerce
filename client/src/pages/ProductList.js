import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProductList.css";
import { useBasket } from "../contexts/BasketContext";
import Modal from 'react-modal';
import { useSearch } from '../contexts/SearchContext';

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
  const [editImages, setEditImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const isAdmin = localStorage.getItem("role") === "admin";

  const { basket, addToBasket, removeFromBasket } = useBasket();
  const { searchTerm, selectedCategory } = useSearch();

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
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      setDeleteConfirmId(null);
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
    setEditImages(
      product.images && product.images.length > 0
        ? [...product.images]
        : (product.imageUrl ? [product.imageUrl] : [])
    );
    setNewImages([]);
    setUpdate(product._id);
  };

  const handleRemoveEditImage = (index) => {
    setEditImages(prev => {
      const removed = prev[index];
      // Eğer silinen görsel bir file ise, newImages'tan da çıkar
      if (removed && removed.preview) {
        setNewImages(nPrev => nPrev.filter(f => f.preview !== removed.preview));
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Önizleme için geçici url oluştur
    const previews = files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
    setNewImages(prev => [...prev, ...previews]);
    setEditImages(prev => [...prev, ...previews]);
  };

  const handleUpdate = async (id) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('name', edit.name);
      formData.append('description', edit.description);
      formData.append('price', edit.price);
      formData.append('stock', edit.stock);
      formData.append('category', edit.category);
      // Sadece url olanları gönder
      const existingUrls = editImages.filter(img => typeof img === 'string');
      formData.append('existingImages', JSON.stringify(existingUrls));
      // Sadece file olanları gönder
      newImages.forEach(file => {
        formData.append('images', file);
      });
      await axios.put(`${process.env.REACT_APP_API_URL}/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Güncel ürünleri çek
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts(res.data.products);
      setEdit({ name: "", description: "", price: "", stock: "", category: "" });
      setEditImages([]);
      setNewImages([]);
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

  // Filtrelenmiş ürünler:
  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'All Categories' || (p.category && p.category === selectedCategory);
    return nameMatch && categoryMatch;
  });

  return (
    <div className="product-list-page">
      <h1 className="product-list-title">Our Products</h1>
      <div className="product-grid">
        {filteredProducts.map((p) => (
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
                <div className="edit-images-list">
                  {editImages.filter(Boolean).map((img, idx) => (
                    <div key={idx} className="edit-image-thumb">
                      <img src={typeof img === 'string' ? img : (img.preview ? img.preview : '')} alt="product" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 8 }} />
                      <button type="button" className="product-edit-save-btn" onClick={() => handleRemoveEditImage(idx)} style={{ marginLeft: 4, padding: '2px 8px', fontSize: 12 }}>Remove</button>
                    </div>
                  ))}
                </div>
                <label htmlFor={`new-images-input-${p._id}`} className="product-edit-save-btn" style={{ display: 'inline-block', margin: '8px 0', padding: '6px 16px', fontSize: 14, cursor: 'pointer' }}>
                  Add Images
                  <input
                    id={`new-images-input-${p._id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleNewImagesChange}
                  />
                </label>
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
                  src={
                    (p.images && Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
                    p.imageUrl ||
                    'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/bb3c451c-65f9-41c0-96e7-4ef839717e5d/JR+ZOOM+SUPERFLY+10+ACAD+FGMG.png'
                  }
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
                    {deleteConfirmId === p._id ? (
                      <span className="delete-confirm-popover">
                        <span>Are you sure?</span>
                        <button className="product-edit-save-btn" style={{marginLeft: 4, padding: '2px 8px', fontSize: 12}} onClick={() => handleDelete(p._id)}>Yes</button>
                        <button className="product-edit-cancel-btn" style={{marginLeft: 4, padding: '2px 8px', fontSize: 12}} onClick={() => setDeleteConfirmId(null)}>No</button>
                      </span>
                    ) : (
                      <button
                        className="product-action-delete-btn"
                        onClick={() => setDeleteConfirmId(p._id)}
                        disabled={isBasketLoading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
                {!isAdmin && (
                  <div className="product-user-actions">
                    {!isInBasket(p._id) ? (
                      <button
                        className="add-to-basket-btn"
                        onClick={() => handleBasketOperation(p)}
                        disabled={isBasketLoading}
                      >
                        {isBasketLoading ? 'Loading...' : 'Add to basket'}
                      </button>
                    ) : (
                      <button
                        className="add-to-basket-btn in-basket"
                        onClick={() => removeFromBasket(p._id)}
                        disabled={isBasketLoading}
                      >
                        Remove from basket
                      </button>
                    )}
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