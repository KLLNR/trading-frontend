import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    userApi.getProducts()
      .then(data => {
        const found = data.find(p => p.id === Number(id));
        setProduct(found);
        if (found?.image_url?.length) setSelectedImage(found.image_url[0]);
      })
      .catch(err => console.error('Error fetching product:', err));
  }, [id]);

  if (!product) return <p className="loading-text">Завантаження...</p>;

  // не показуємо кнопку обміну для свого товару
  const canProposeExchange = product.owner_id !== currentUser.id;

  return (
    <div className="product-detail-container">
      <Link to="/categories" className="back-link">← Назад</Link>

      <div className="product-detail-card">
        <div className="product-gallery">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.title}
              className="main-image"
            />
          ) : (
            <p className="no-image">Зображення відсутнє</p>
          )}

          <div className="thumbnail-row">
            {product.image_url && product.image_url.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.title} ${index + 1}`}
                className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h2>{product.title}</h2>
          <p><strong>Категорія:</strong> {product.category}</p>
          <p><strong>Кількість:</strong> {product.count}</p>

          {product.is_for_sale ? (
            <p className="price"><strong>Ціна:</strong> {product.price} грн</p>
          ) : (
            <p className="exchange">На обмін</p>
          )}

          <p><strong>Опис:</strong> {product.description}</p>
          <p><strong>Контакти:</strong> {product.contactInfo}</p>

          {canProposeExchange && (
            <button
              className="exchange-btn"
              onClick={() => navigate(`/exchange/propose/${product.id}`)}
            >
              Запропонувати обмін
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
