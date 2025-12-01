import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import paymentApi from '../api/paymentApi';
import userApi from '../api/userApi';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const myId = currentUser ? Number(currentUser.id) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const found = await productApi.getProductById(id);
        setProduct(found);

        const imgSource = found.imageUrl;
        const images = Array.isArray(imgSource) ? imgSource : [imgSource];
        const validImages = images.filter(img => img && img.trim() !== '');

        if (validImages.length > 0) {
            setSelectedImage(validImages[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Товар не знайдено або сталась помилка');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.ownerId) {
        userApi.getUserById(product.ownerId)
            .then(data => {
                const nameDisplay = data.lastName 
                    ? `${data.firstName} ${data.lastName.charAt(0)}.` 
                    : data.firstName;
                setOwnerName(nameDisplay);
            })
            .catch(err => console.error(err));
    }
  }, [product]);

  useEffect(() => {
    const handleEsc = (e) => {
        if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) return <div className="loading-container"><p className="loading-text">Завантаження...</p></div>;
  if (error || !product) return <div className="error-container"><p className="error-text">{error}</p></div>;

  const ownerId = Number(product.ownerId);
  const isOwner = myId === ownerId;
  
  const rawImages = Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl];
  const images = rawImages.filter(img => img && img.trim() !== '');

  const handleDelete = async () => {
    if (window.confirm('Ви точно бажаєте видалити цей товар назавжди?')) {
      try {
        await productApi.deleteProduct(id);
        alert('Товар успішно видалено!');
        navigate('/categories');
      } catch (err) {
        alert(err.message || 'Не вдалося видалити товар');
      }
    }
  };

  const handleBuy = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Токен відсутній. Увійдіть заново');
        navigate('/login');
        return;
      }
  
      const payment = await paymentApi.createPayment(productId);
      window.location.href = payment.sessionUrl; 
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert('Токен недійсний. Увійдіть заново');
        navigate('/login');
      } else {
        alert(err.message || 'Помилка платежу');
      }
    }
  };

  const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
          setIsModalOpen(false);
      }
  };

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate(-1)} className="back-link">
        &larr; Назад
      </button>

      {isModalOpen && selectedImage && (
        <div className="image-modal-overlay" onClick={handleBackdropClick}>
            <div className="image-modal-content">
                <span className="close-modal-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
                <img src={selectedImage} alt="Full screen view" />
            </div>
        </div>
      )}

      <div className="product-detail-card">
        <div className="product-gallery">
          {selectedImage ? (
            <img 
                src={selectedImage} 
                alt={product.title} 
                className="main-image clickable-image"
                onClick={() => setIsModalOpen(true)}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
            />
          ) : (
            <div className="no-image-placeholder">Немає фото</div>
          )}

          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`View ${i}`}
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          
          {product.ownerId && !isOwner && (
            <div className="owner-section-top" style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#555' }}>
              <span>Власник: </span>
              <Link to={`/user/${product.ownerId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                {ownerName || 'Завантаження...'}
              </Link>
            </div>
          )}

          <div className="product-header">
            <h2>{product.title}</h2>
            <span className="product-date">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('uk-UA') : ''}
            </span>
          </div>

          <div className="product-meta">
             <p><strong>Категорія:</strong> {product.category?.name || 'Інше'}</p>
             
             {product.isForSale ? (
                <p className="price-tag">
                    {Number(product.price).toLocaleString('uk-UA')} <small>грн</small>
                </p>
             ) : (
                <p className="exchange-tag">Тільки обмін</p>
             )}
          </div>

          <div className="product-description">
            <strong>Опис:</strong>
            <p>{product.description}</p>
          </div>

          <div className="action-buttons">
            {!isOwner ? (
              <div className="buyer-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {product.isForSale && (
                   <button className="buy-btn" onClick={() => handleBuy(product.id)}>
                     Купити
                   </button>
                )}
                {product.isForTrade && (
                  <button
                    className="exchange-btn"
                    onClick={() => navigate(`/exchange/propose/${id}`)}
                  >
                    Запропонувати обмін
                  </button>
                )}
              </div>
            ) : (
              <div className="owner-actions" style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="edit-btn" 
                  onClick={() => navigate(`/edit-product/${id}`)}
                >
                  Редагувати
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Видалити
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;