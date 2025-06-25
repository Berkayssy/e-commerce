import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from 'react-modal';
import { useBasket } from '../contexts/BasketContext';
import "./ProductDetail.css";

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToBasket, removeFromBasket, basket } = useBasket();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProduct(res.data.product);
      } catch (err) {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) setCurrentImageIndex(0);
  }, [product]);

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);

  const goToNextSlide = () => setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  const goToPrevSlide = () => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleAddToBasket = () => addToBasket(product);
  const isInBasket = product && basket.some((item) => item._id === product._id);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <p className="error">Product not found</p>;

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-to-products-link">← Back to Products</Link>
      <div className="product-detail-card">
        <div className="image-slider-container">
          <img 
            className="product-detail-image" 
            src={productImages[currentImageIndex] || '/placeholder-image.png'}
            alt={product.name}
            onError={e => { e.target.src = '/placeholder-image.png'; }}
            onClick={openModal}
          />
          {productImages.length > 1 && (
            <button className="slider-arrow left-arrow" onClick={goToPrevSlide}>←</button>
          )}
          {productImages.length > 1 && (
            <button className="slider-arrow right-arrow" onClick={goToNextSlide}>→</button>
          )}
        </div>
        <h2 className="product-detail-name">{product.name}</h2>
        <p className="product-detail-description"><strong>Description:</strong> {product.description}</p>
        <p className="product-detail-price"><strong>Price:</strong> ${product.price}</p>
        <p className="product-detail-stock"><strong>Stock:</strong> {product.stock}</p>
        <p className="product-detail-category"><strong>Category:</strong> {product.category}</p>
        {product && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {isInBasket ? (
              <button
                className="product-detail-remove-basket-btn product-detail-add-to-basket-btn in-basket"
                onClick={() => removeFromBasket(product._id)}
              >
                Remove from Basket
              </button>
            ) : (
              <button
                className="product-detail-add-to-basket-btn"
                onClick={handleAddToBasket}
              >
                Add to Basket
              </button>
            )}
            <button
              className="product-detail-buy-now-btn product-detail-add-to-basket-btn buy-now-animated-btn"
              onClick={() => {
                addToBasket(product);
                window.location.href = '/basket';
              }}
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="product-image-modal"
        overlayClassName="product-image-overlay"
      >
        <button onClick={closeModal} className="modal-close-btn">X</button>
        <img 
          src={productImages[currentImageIndex] || '/placeholder-image.png'}
          alt={product.name}
          className="modal-image"
        />
        {productImages.length > 1 && (
          <button className="modal-slider-arrow modal-left-arrow" onClick={goToPrevSlide}>←</button>
        )}
        {productImages.length > 1 && (
          <button className="modal-slider-arrow modal-right-arrow" onClick={goToNextSlide}>→</button>
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail;