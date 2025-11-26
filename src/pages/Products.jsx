import React, { useEffect, useState, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { CATEGORIES } from '../api/constants';
import '../styles/Products.css';
import '../styles/Categories.css';

const getCategoryName = (categoryId) => {
  const cat = CATEGORIES.find(c => c.id === Number(categoryId));
  return cat ? cat.name : 'Інше';
};

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

  const getProductImage = (product) => {
    if (Array.isArray(product.imageUrl)) {
        return product.imageUrl[0];
    }
    return product?.imageUrl || 'https://via.placeholder.com/300';
  };

  const getProductTitle = (product) => product?.title || 'Без назви';

  const loadProducts = useCallback(async (pageNumber = 0) => {
    try {
      if (pageNumber === 0) setLoading(true);
      else setLoadingMore(true);

      const { content = [], last } = await productApi.getProducts({
        page: pageNumber,
        size: 12,
        sort: 'id,desc'
      });

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
  }, [myId]); 

  useEffect(() => {
    if (!myId) {
      setError('Ви не авторизовані');
      setLoading(false);
      return;
    }
    loadProducts(0);
  }, [myId, loadProducts]); 

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();

    if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;

    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      
      if (products.length < 3 && hasMore) {
        handleLoadMore();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Не вдалося видалити товар');
    }
  };

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
            <li
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <img src={getProductImage(product)} alt={getProductTitle(product)} />

              <h3>{getProductTitle(product)}</h3>

              <div className="product-meta-row">
                <span className="category-label">
                  {getCategoryName(product.categoryId || product.category?.id)}
                </span>
                
                <span className="product-date">
                  {product.createdAt 
                    ? new Date(product.createdAt).toLocaleDateString('uk-UA') 
                    : ''}
                </span>
              </div>

              {product.isForSale ? (
                <p className="product-price">{product.price ?? 0} грн</p>
              ) : product.isForTrade ? (
                <p className="product-exchange">На обмін</p>
              ) : null}

              <button
                className="delete-btn"
                onClick={(e) => handleDelete(e, product.id)}
                style={{ marginTop: '10px', width: '100%', zIndex: 2 }}
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