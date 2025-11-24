import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import '../styles/Products.css';

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = Number(currentUser?.id);

  // --------- LOAD PRODUCTS ----------
  const loadProducts = async (pageNumber = 0) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);

      const { content = [], last } = await productApi.getProducts({
        page: pageNumber,
        size: 12,
        sort: 'id,desc'
      });

      // Фільтруємо лише товари користувача
      const myProducts = content.filter(p => Number(p.ownerId || p.owner_id) === myId);

      if (pageNumber === 0) {
        setProducts(myProducts);
      } else {
        setProducts(prev => [...prev, ...myProducts]);
      }

      setHasMore(!last);
    } catch (err) {
      console.error('Помилка завантаження:', err);
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!myId) {
      setError('Ви не авторизовані');
      setLoading(false);
      return;
    }
    loadProducts(0);
  }, [myId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  // --------- DELETE PRODUCT ----------
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;

    try {
      await productApi.deleteProduct(id);

      // Видаляємо зі списку
      setProducts(prev => prev.filter(p => p.id !== id));

      // Автодозавантаження, якщо залишилося мало
      if (products.length < 3 && hasMore) handleLoadMore();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Не вдалося видалити товар');
    }
  };

  // --------- RENDER ----------
  if (loading) return <div className="loading-text">Завантаження...</div>;
  if (error) return <div className="error-text">{error}</div>;

  return (
    <div className="products-container">
      <h2>Мої товари ({products.length})</h2>

      {products.length === 0 ? (
        <div className="no-products">
          <p>У вас ще немає товарів.</p>
          <button onClick={() => navigate('/add-product')} className="exchange-btn">
            Додати перший товар
          </button>
        </div>
      ) : (
        <ul className="products-list">
          {products.map(product => (
            <li key={product.id} className="product-card">

              {/* ПЕРЕХІД НА КАРТКУ */}
              <div onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: "pointer" }}>
                <img
                  src={
                    Array.isArray(product.imageUrl)
                      ? product.imageUrl[0]
                      : product.imageUrl || 'https://via.placeholder.com/300?text=Немає+фото'
                  }
                  alt={product.title}
                  onError={e => (e.target.src = 'https://via.placeholder.com/300?text=Немає+фото')}
                />

                <h3>{product.title}</h3>
                <p>{product.isForSale ? `Ціна: ${product.price} грн` : 'На обмін'}</p>
                <p className="product-date">
                  Додано: {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString('uk-UA')
                    : 'невідомо'}
                </p>
              </div>

              {/* КНОПКА ВИДАЛИТИ */}
              <button
                className="delete-btn"
                onClick={() => handleDelete(product.id)}
              >
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Завантаження..." : "Показати ще"}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => navigate('/add-product')} className="exchange-btn">
          Додати новий товар
        </button>
      </div>
    </div>
  );
};

export default Products;
