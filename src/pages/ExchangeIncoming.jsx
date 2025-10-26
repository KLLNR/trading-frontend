import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { Link } from 'react-router-dom';

const ExchangeIncoming = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getIncomingExchanges().then((data) => {
      setExchanges(data);
      setLoading(false);
    });
  }, []);

  const handleAccept = async (id) => {
    const updated = await userApi.acceptExchange(id);
    setExchanges((prev) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
  };

  const handleReject = async (id) => {
    const updated = await userApi.rejectExchange(id);
    setExchanges((prev) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
  };

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>Вхідні пропозиції обміну</h1>
      {exchanges.length === 0 && <p>Немає пропозицій</p>}
      <ul>
        {exchanges.map((e) => (
          <li key={e.id} style={{ marginBottom: '20px' }}>
            <p>Від користувача: {e.from_user_id}</p>
            <p>Твій товар: {e.product_to_id}</p>
            <p>Його товар: {e.product_from_id}</p>
            <p>Статус: {e.status}</p>
            {e.status === 'PENDING' && (
              <>
                <button onClick={() => handleAccept(e.id)}>Прийняти</button>
                <button onClick={() => handleReject(e.id)}>Відхилити</button>
              </>
            )}
            <Link to={`/exchange/${e.id}`}>Переглянути деталі</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExchangeIncoming;
