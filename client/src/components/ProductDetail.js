import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from 'react-modal';
import OrderModal from '../modals/OrderModal';
import "./ProductDetail.css";

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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
        console.error("Error fetching product detail:", err.response?.data || err.message);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Reset currentImageIndex when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
    }
  }, [product]);

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);

  const goToNextSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % productImages.length
    );
  };

  const goToPrevSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + productImages.length) % productImages.length
    );
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <p className="error">Product not found</p>;

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-to-products-link">
        ← Back to Products
      </Link>

      <div className="product-detail-card">
        <div className="image-slider-container">
          <img 
            className="product-detail-image" 
            src={productImages[currentImageIndex] || '/placeholder-image.png'}
            alt={product.name}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
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

        <button
          className="product-detail-confirm-order-btn"
          onClick={() => setIsOrderModalOpen(true)}
        >
          Confirm Order
        </button>
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

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;