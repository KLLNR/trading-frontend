import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ExchangeDetail.css';

const statusColors = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
  COMPLETED: 'blue'
};

const ExchangeDetail = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [exchange, setExchange] = useState(null);

  useEffect(() => {
    userApi.getExchangeById(id).then(setExchange);
  }, [id]);

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;
  if (!exchange) return <p className="exchange-message">Не знайдено</p>;

  const isOwner = user.id === exchange.to_user_id;

  const handleUpdate = async (type) => {
    const updated =
      type === 'accept'
        ? await userApi.acceptExchange(id)
        : await userApi.rejectExchange(id);
    setExchange(updated);
  };

  return (
    <div className="exchange-detail-container">
      <h2>Деталі обміну</h2>

      <div className="exchange-info">
        <p><strong>Від:</strong> {exchange.from_user_id}</p>
        <p><strong>Кому:</strong> {exchange.to_user_id}</p>
        <p><strong>Його товар:</strong> {exchange.product_from_id}</p>
        <p><strong>Твій товар:</strong> {exchange.product_to_id}</p>
      </div>

      <div
        className={`exchange-status ${exchange.status}`}
        style={{ color: statusColors[exchange.status] }}
      >
        Статус: {exchange.status}
      </div>

      {exchange.status === 'PENDING' && isOwner && (
        <div className="exchange-actions">
          <button onClick={() => handleUpdate('accept')}>Прийняти</button>
          <button className="reject" onClick={() => handleUpdate('reject')}>Відхилити</button>
        </div>
      )}
    </div>
  );
};

export default ExchangeDetail;
