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
        const response = await productApi.searchProducts(query, { page: currentPage, size: 12 });
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
    <div className="view-products-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Назад
      </button>

      <h2>Результати пошуку за запитом: <strong>"{query}"</strong></h2>
      
      {loading ? (
        <p className="loading">Пошук товарів...</p>
      ) : products.length === 0 ? (
        <div className="no-results">
          <p>За запитом "<strong>{query}</strong>" нічого не знайдено</p>
          <p>Спробуйте інший запит</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img 
                  src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl || '/placeholder.jpg'} 
                  alt={product.title}
                />
                
                <div className="card-info">
                  <h3>{product.title}</h3>
                  
                  <div className="product-meta">
                    <span className="category">
                      {product.category?.name || 'Інше'}
                    </span>
                    <span className="separator">•</span>
                    <span className="date">
                      {product.createdAt 
                        ? new Date(product.createdAt).toLocaleDateString('uk-UA') 
                        : ''}
                    </span>
                  </div>
                </div>

                {/* 3. ЦІНА (Права частина) */}
                <div className="card-price-block">
                  {product.isForSale ? (
                    <p className="price">{product.price} грн</p>
                  ) : (
                    <p className="exchange">На обмін</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                ← Назад
              </button>
              <span>{currentPage + 1} з {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Далі →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewProducts;