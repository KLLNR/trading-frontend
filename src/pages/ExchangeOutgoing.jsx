import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { Link } from 'react-router-dom';

const ExchangeOutgoing = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getOutgoingExchanges().then((data) => {
      setExchanges(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>Вихідні пропозиції обміну</h1>
      {exchanges.length === 0 && <p>Немає пропозицій</p>}
      <ul>
        {exchanges.map((e) => (
          <li key={e.id} style={{ marginBottom: '20px' }}>
            <p>Кому: {e.to_user_id}</p>
            <p>Твій товар: {e.product_from_id}</p>
            <p>Його товар: {e.product_to_id}</p>
            <p>Статус: {e.status}</p>
            <Link to={`/exchange/${e.id}`}>Переглянути деталі</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExchangeOutgoing;
