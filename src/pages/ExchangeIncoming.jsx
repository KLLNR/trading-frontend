import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ExchangeIncoming.css';

const statusLabels = {
  PENDING: 'В очікуванні',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
  COMPLETED: 'Завершено'
};

const ExchangeIncoming = () => {
  const { user, loading } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setProducts(await userApi.getProducts());
      setExchanges(await userApi.getIncomingExchanges());
    };
    load();
  }, [user?.id]);

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;

  const getProductName = (id) =>
    products.find((p) => p.id === id)?.title || 'Без назви';

  return (
    <div className="exchange-incoming-container">
      <h1>Вхідні пропозиції обміну</h1>

      <ul className="exchange-list">
        {exchanges.length === 0 && (
          <p className="exchange-message">Немає вхідних пропозицій</p>
        )}

        {exchanges.map((e) => (
          <li key={e.id} className={`exchange-item fade-in`}>
            <div className="exchange-details">
              <p><strong>Твій товар:</strong> {getProductName(e.product_to_id)}</p>
              <p><strong>Його товар:</strong> {getProductName(e.product_from_id)}</p>
              <p className={`status ${e.status}`}>{statusLabels[e.status]}</p>
            </div>

            <div className="exchange-actions">
              {e.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => userApi.acceptExchange(e.id)}
                    className="accept"
                  >
                    Прийняти
                  </button>
                  <button
                    onClick={() => userApi.rejectExchange(e.id)}
                    className="reject"
                  >
                    Відхилити
                  </button>
                </>
              )}
              <Link to={`/exchange/${e.id}`} className="view-link">
                Переглянути
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExchangeIncoming;
