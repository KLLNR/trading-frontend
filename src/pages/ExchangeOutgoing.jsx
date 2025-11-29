import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import exchangeApi from '../api/exchangeApi';
import productApi from '../api/productApi';
import '../styles/ExchangeOutgoing.css';

const statusLabels = {
  PENDING: 'В очікуванні',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
  COMPLETED: 'Завершено',
  CANCELED: 'Скасовано' // Додаємо, бо в бекенді є CANCELED
};

const ExchangeOutgoing = () => {
  const { user, loading } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [products, setProducts] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        // Отримуємо вихідні пропозиції з пагінацією
        const outgoingResponse = await exchangeApi.getOutgoingProposals({
          page: currentPage,
          size: 10, // Регульована кількість на сторінці
          sort: 'createdAt,desc'
        });

        setExchanges(outgoingResponse.content || []);
        setTotalPages(outgoingResponse.totalPages || 1);

        // Отримуємо всі продукти для імен (кешуємо)
        const allProducts = await productApi.getProducts({ size: 1000 });
        const productsMap = {};
        (allProducts.content || allProducts).forEach(p => {
          productsMap[p.id] = p;
        });
        setProducts(productsMap);
      } catch (err) {
        console.error('Помилка завантаження:', err);
        setError('Не вдалося завантажити пропозиції');
      }
    };

    load();
  }, [user?.id, currentPage]);

  const getProductName = (id) => products[id]?.title || 'Без назви';

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;
  if (error) return <p className="exchange-message">{error}</p>;

  return (
    <div className="exchange-outgoing-container">
      <h1>Мої пропозиції обміну</h1>
      {exchanges.length === 0 ? (
        <p className="exchange-message">Немає вихідних пропозицій</p>
      ) : (
        <ul className="exchange-list">
          {exchanges.map((e) => (
            <li key={e.id} className="exchange-item fade-in">
              <div className="exchange-details">
                <p><strong>Ваш товар:</strong> {getProductName(e.productFromId)}</p>
                <p><strong>Товар користувача:</strong> {getProductName(e.productToId)}</p>
                <p className={`status ${e.status}`}>{statusLabels[e.status] || e.status}</p>
              </div>
              <div className="exchange-actions">
                <Link to={`/exchange/${e.id}`} className="view-link">
                  Деталі
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
            disabled={currentPage === 0}
          >
            Назад
          </button>
          <span>{currentPage + 1} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
            disabled={currentPage >= totalPages - 1}
          >
            Далі
          </button>
        </div>
      )}
    </div>
  );
};

export default ExchangeOutgoing;