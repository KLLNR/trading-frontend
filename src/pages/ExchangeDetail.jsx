import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import exchangeApi from '../api/exchangeApi';
import productApi from '../api/productApi';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ExchangeDetail.css';

const statusLabels = {
  PENDING: 'Очікує підтвердження',
  ACCEPTED: 'Прийнято',
  REJECTED: 'Відхилено',
  CANCELED: 'Скасовано'
};

const statusColors = {
  PENDING: 'orange',
  ACCEPTED: 'green',
  REJECTED: 'red',
  CANCELED: 'gray'
};

const ExchangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const [proposal, setProposal] = useState(null);
  const [products, setProducts] = useState({});
  const [shippingAddress, setShippingAddress] = useState(null);
  const [error, setError] = useState('');

  const [fromUserName, setFromUserName] = useState('');
  const [toUserName, setToUserName] = useState('');

  useEffect(() => {
    const loadProposal = async () => {
      try {
        const proposalData = await exchangeApi.getProposal(id);
        setProposal(proposalData);

        const allProducts = await productApi.getProducts({ size: 1000 });
        const productsMap = {};
        (allProducts.content || allProducts).forEach(p => {
          productsMap[p.id] = p;
        });
        setProducts(productsMap);

        if (proposalData.status === 'ACCEPTED' && user.id === proposalData.toUserId) {
          const cached = localStorage.getItem(`shipping_${id}`);
          if (cached) {
            setShippingAddress(JSON.parse(cached));
            return;
          }

          try {
            const accessData = await exchangeApi.acceptProposal(id);
            if (accessData.shippingAddress) {
              const addressWithPhone = {
                ...accessData.shippingAddress,
                phone: accessData.shippingAddress.phone || 
                       accessData.shippingAddress.phoneNumber ||
                       'Не вказано'
              };
              setShippingAddress(addressWithPhone);
              localStorage.setItem(`shipping_${id}`, JSON.stringify(addressWithPhone));
            }
          } catch (err) {
            console.warn('Адреса вже була отримана раніше');
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Не вдалося завантажити дані пропозиції');
      }
    };

    loadProposal();
  }, [id, user?.id]);

  useEffect(() => {
    if (proposal) {
        const formatName = (u) => `${u.firstName} ${u.lastName ? u.lastName.charAt(0) + '.' : ''}`;

        userApi.getUserById(proposal.fromUserId)
            .then(data => setFromUserName(formatName(data)))
            .catch(() => setFromUserName(`Користувач #${proposal.fromUserId}`));

        userApi.getUserById(proposal.toUserId)
            .then(data => setToUserName(formatName(data)))
            .catch(() => setToUserName(`Користувач #${proposal.toUserId}`));
    }
  }, [proposal]);

  const getProductNames = (productIds) => {
    if (!productIds || !Array.isArray(productIds)) return 'Товари відсутні';
    return productIds.map(id => products[id]?.title || `Товар ID: ${id}`).join(', ');
  };

  const isToUser = user?.id === proposal?.toUserId;

  const handleCancel = async () => {
    if (window.confirm('Ви впевнені, що бажаєте скасувати цю пропозицію?')) {
      try {
        const updated = await exchangeApi.cancelProposal(id);
        setProposal(updated);
        alert('Пропозицію успішно скасовано');
      } catch (err) {
        alert(err.message || 'Виникла помилка при скасуванні');
      }
    }
  };

  const handleAccept = async () => {
    if (window.confirm('Ви підтверджуєте згоду на обмін?')) {
      try {
        const updated = await exchangeApi.acceptProposal(id);
        setProposal(updated);

        if (user.id === proposal.toUserId && updated.shippingAddress) {
          const addressWithPhone = {
            ...updated.shippingAddress,
            phone: updated.shippingAddress.phone || 
                   updated.shippingAddress.phoneNumber ||
                   'Не вказано'
          };
          setShippingAddress(addressWithPhone);
          localStorage.setItem(`shipping_${id}`, JSON.stringify(addressWithPhone));
        }

        alert('Пропозицію прийнято. Адресу для відправки отримано!');
      } catch (err) {
        alert(err.message || 'Виникла помилка при прийнятті пропозиції');
      }
    }
  };

  const handleReject = async () => {
    if (window.confirm('Ви впевнені, що бажаєте відхилити пропозицію?')) {
      try {
        const updated = await exchangeApi.rejectProposal(id);
        setProposal(updated);
        alert('Пропозицію відхилено');
      } catch (err) {
        alert(err.message || 'Виникла помилка при відхиленні');
      }
    }
  };

  const handleCounter = async () => {
    navigate(`/exchange/${id}/counter`);
  };

  const linkStyle = {
    color: 'var(--primary-color, #007bff)', 
    textDecoration: 'none',
    fontWeight: 'bold',
    marginLeft: '6px'
  };

  if (loading) return <p className="exchange-message">Завантаження даних...</p>;
  if (!user) return <p className="exchange-message">Будь ласка, авторизуйтесь для перегляду</p>;
  if (error) return <p className="exchange-message">{error}</p>;
  if (!proposal) return <p className="exchange-message">Інформація завантажується...</p>;

  return (
    <div className="exchange-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">Повернутися назад</button>

      <h2>Деталі пропозиції обміну</h2>
      <div className="exchange-info">
        
        <div className="users-info">
          <p>
            <strong>Відправник пропозиції:</strong> 
            {user.id === proposal.fromUserId ? (
               <span style={{ marginLeft: '6px' }}>Ви</span>
            ) : (
               <Link to={`/user/${proposal.fromUserId}`} style={linkStyle}>
                 {fromUserName || 'Завантаження...'}
               </Link>
            )}
          </p>

          <p>
            <strong>Отримувач пропозиції:</strong> 
            {isToUser ? (
               <span style={{ marginLeft: '6px' }}>Ви</span>
            ) : (
               <Link to={`/user/${proposal.toUserId}`} style={linkStyle}>
                 {toUserName || 'Завантаження...'}
               </Link>
            )}
          </p>
        </div>

        <div className="products-info">
          <div className="products-section">
            <h4>Пропоновані товари (від ініціатора):</h4>
            <p>{getProductNames(proposal.productFromId)}</p>
          </div>
          <div className="products-section">
            <h4>Запитувані товари (ваші):</h4>
            <p>{getProductNames(proposal.productToId)}</p>
          </div>
        </div>

        <p><strong>Дата створення:</strong> {new Date(proposal.createdAt).toLocaleString('uk-UA')}</p>
      </div>

      <div 
        className={`exchange-status ${proposal.status}`} 
        style={{ 
          backgroundColor: statusColors[proposal.status] + '20',
          color: statusColors[proposal.status],
          border: `2px solid ${statusColors[proposal.status]}`,
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '20px 0'
        }}>
        {statusLabels[proposal.status] || proposal.status}
      </div>

      {proposal.status === 'ACCEPTED' && isToUser && shippingAddress && (
        <div className="shipping-info">
          <h3>Куди відправляти ваш товар:</h3>
          <div className="address-details">
            <p><strong>Країна:</strong> {shippingAddress.country}</p>
            <p><strong>Поштовий індекс:</strong> {shippingAddress.postalCode}</p>
            <p><strong>Місто:</strong> {shippingAddress.city}</p>
            <p><strong>Вулиця/Відділення:</strong> {shippingAddress.street}</p>
          </div>
          <p className="shipping-note">
            Ви прийняли пропозицію — надішліть свій товар на цю адресу першому. 
            Після отримання ініціатор надішле свій.
          </p>
        </div>
      )}

      {proposal.status === 'ACCEPTED' && isToUser && !shippingAddress && (
        <div className="address-action">
          <button 
            onClick={() => {
              exchangeApi.acceptProposal(id).then(data => {
                if (data.shippingAddress) {
                  setShippingAddress(data.shippingAddress);
                  localStorage.setItem(`shipping_${id}`, JSON.stringify(data.shippingAddress));
                }
              }).catch(() => alert('Адреса ще недоступна'));
            }}
            className="show-address-btn large"
          >
            Отримати адресу для відправки
          </button>
        </div>
      )}

      {proposal.status === 'PENDING' && (
        <div className="exchange-actions">
          {isToUser ? (
            <>
              <button onClick={handleAccept} className="accept-btn large">
                Прийняти пропозицію
              </button>
              <button onClick={handleReject} className="reject-btn large">
                Відхилити
              </button>
              <button onClick={handleCounter} className="counter-btn large">
                Запропонувати інші умови
              </button>
            </>
          ) : (
            <button onClick={handleCancel} className="cancel-btn large">
              Скасувати пропозицію
            </button>
          )}
        </div>
      )}

      {proposal.status === 'ACCEPTED' && (
        <div className="success-message">
          <h3>Обмін успішно узгоджено</h3>
          {isToUser ? (
            <p>Ви прийняли пропозицію — ви надсилаєте товар першим.</p>
          ) : (
            <p>Очікуйте відправку від того, хто прийняв вашу пропозицію.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExchangeDetail;