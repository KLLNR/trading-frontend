import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    userApi.getProducts()
      .then(data => {
        const found = data.find(p => p.id === Number(id));
        setProduct(found);
        if (found?.images?.length) setSelectedImage(found.images[0]);
      })
      .catch(err => console.error('Error fetching product:', err));
  }, [id]);

  if (!product) return <p className="loading-text">Завантаження...</p>;

  return (
    <div className="product-detail-container">
      <Link to="/categories" className="back-link">← Назад до категорій</Link>

      <div className="product-detail-card">
        <div className="product-gallery">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.name}
              className="main-image"
            />
          ) : (
            <p className="no-image">Зображення відсутнє</p>
          )}

          <div className="thumbnail-row">
            {product.images && product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h2>{product.name}</h2>
          <p><strong>Категорія:</strong> {product.category}</p>
          <p><strong>Кількість:</strong> {product.count}</p>
          <p><strong>Опис:</strong> {product.description}</p>
          <p><strong>Контакти:</strong> {product.contactInfo}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
