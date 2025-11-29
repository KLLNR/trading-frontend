import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import '../styles/ViewProducts.css';

const ViewProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q')?.trim() || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!query) {
      navigate('/categories');
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await productApi.searchProducts(query, { page: currentPage, size: 10 });
        setProducts(response.content || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Помилка пошуку:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, navigate]);

  if (!query) return null;

  return (
    <div className="vp-wrapper">
      <button onClick={() => navigate(-1)} className="vp-back-btn">
        ← Назад
      </button>

      <h2 className="vp-title">Результати пошуку: <strong>"{query}"</strong></h2>
      
      {loading ? (
        <p className="vp-loading">Завантаження...</p>
      ) : products.length === 0 ? (
        <div className="vp-empty">
          <p>Нічого не знайдено за запитом "<strong>{query}</strong>"</p>
        </div>
      ) : (
        <>
          <div className="vp-list-container">
            {products.map(product => (
              <div
                key={product.id}
                className="vp-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img 
                  src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl || '/placeholder.jpg'} 
                  alt={product.title}
                  className="vp-card-img"
                />
                
                <div className="vp-card-content">
                  <h3 className="vp-card-title">{product.title}</h3>
                  
                  <div className="vp-meta-row">
                    <span className="vp-tag">
                      {product.category?.name || 'Інше'}
                    </span>
                    <span className="vp-date">
                      {product.createdAt 
                        ? new Date(product.createdAt).toLocaleDateString('uk-UA') 
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="vp-price-area">
                  {product.isForSale ? (
                    <p className="vp-price-main">{product.price} грн</p>
                  ) : (
                    <p className="vp-price-exchange">Обмін</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="vp-pagination">
              <button 
                className="vp-pag-btn"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                ←
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                {currentPage + 1} / {totalPages}
              </span>
              <button 
                className="vp-pag-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewProducts;