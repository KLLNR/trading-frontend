import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import exchangeApi from '../api/exchangeApi';
import productApi from '../api/productApi';
import '../styles/ExchangeIncoming.css';

const statusLabels = {
  PENDING: 'В очікуванні',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
  COMPLETED: 'Завершено',
  CANCELED: 'Скасовано' 
};

const ExchangeIncoming = () => {
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
        const incomingResponse = await exchangeApi.getIncomingProposals({
          page: currentPage,
          size: 10,
          sort: 'createdAt,desc'
        });

        setExchanges(incomingResponse.content || []);
        setTotalPages(incomingResponse.totalPages || 1);

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

  const handleAccept = async (proposalId) => {
    try {
      const updated = await exchangeApi.acceptProposal(proposalId);
      setExchanges(prev => prev.map(e => e.id === proposalId ? updated : e));
      alert('Пропозицію прийнято!');
    } catch (err) {
      alert(err.message || 'Помилка прийняття');
    }
  };

  const handleReject = async (proposalId) => {
    try {
      const updated = await exchangeApi.rejectProposal(proposalId);
      setExchanges(prev => prev.map(e => e.id === proposalId ? updated : e));
      alert('Пропозицію відхилено');
    } catch (err) {
      alert(err.message || 'Помилка відхилення');
    }
  };

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;
  if (error) return <p className="exchange-message">{error}</p>;

  return (
    <div className="exchange-incoming-container">
      <h1>Вхідні пропозиції обміну</h1>
      {exchanges.length === 0 ? (
        <p className="exchange-message">Немає вхідних пропозицій</p>
      ) : (
        <ul className="exchange-list">
          {exchanges.map((e) => (
            <li key={e.id} className="exchange-item fade-in">
              <div className="exchange-details">
                <p><strong>Ваш товар:</strong> {getProductName(e.productToId)}</p>
                <p><strong>Товар користувача:</strong> {getProductName(e.productFromId)}</p>
                <p className={`status ${e.status}`}>{statusLabels[e.status] || e.status}</p>
              </div>
              <div className="exchange-actions">
                {e.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleAccept(e.id)} className="accept-btn">
                      Прийняти
                    </button>
                    <button onClick={() => handleReject(e.id)} className="reject-btn">
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

export default ExchangeIncoming;