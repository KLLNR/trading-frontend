import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ExchangeOutgoing.css';

const statusLabels = {
  PENDING: 'В очікуванні',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
  COMPLETED: 'Завершено'
};

const ExchangeOutgoing = () => {
  const { user, loading } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        const prods = await userApi.getProducts();
        const out = await userApi.getOutgoingExchanges();
        setProducts(prods);
        setExchanges(out);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [user?.id]);

  const getProductName = (id) =>
    products.find((p) => p.id === id)?.title || 'Без назви';

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;

  return (
    <div className="exchange-outgoing-container">
      <h1>Вихідні пропозиції обміну</h1>

      {exchanges.length === 0 && (
        <p className="exchange-message">Немає вихідних пропозицій</p>
      )}

      <ul className="exchange-list">
        {exchanges.map((e) => (
          <li key={e.id} className="exchange-item fade-in">
            <div className="exchange-details">
              <p><strong>Твій товар:</strong> {getProductName(e.product_from_id)}</p>
              <p><strong>Його товар:</strong> {getProductName(e.product_to_id)}</p>
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
    </div>
  );
};

export default ExchangeOutgoing;
