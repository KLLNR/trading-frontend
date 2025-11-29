import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import exchangeApi from '../api/exchangeApi';
import productApi from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import '../styles/CounterProposal.css';

const CounterProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [myProducts, setMyProducts] = useState([]); 
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productsMap, setProductsMap] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const loadData = async () => {
      setLoadingData(true);
      setError('');
      try {
        const proposalData = await exchangeApi.getProposal(id);
        if (proposalData.toUserId !== user.id) {
          throw new Error('Ви не можете робити контрпропозицію на цей запит.');
        }
        setProposal(proposalData);

        const allProductsResponse = await productApi.getProducts({ size: 1000 });
        const allContent = allProductsResponse.content || allProductsResponse;
        const map = {};
        allContent.forEach(p => { map[p.id] = p.title; });
        setProductsMap(map);

        let userProducts = [];
        try {
          const response = await productApi.getUserProducts(user.id, { size: 100 });
          userProducts = response.content || response;
        } catch (err) {
          console.warn('Fallback loading products...');
          userProducts = allContent.filter(p => p.ownerId === user.id || p.user?.id === user.id);
        }

        const filteredProducts = userProducts.filter(p => 
             p.isForTrade === true && p.isForSale === false
        );
        setMyProducts(filteredProducts);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Не вдалося завантажити дані.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, user?.id, authLoading]);

  const handleSubmit = async () => {
    if (!selectedProductId) {
      alert('Будь ласка, оберіть товар для обміну.');
      return;
    }
    if (!window.confirm('Надіслати цю контрпропозицію?')) return;
    setSubmitLoading(true);
    try {
      const requestDto = { counterProductId: [Number(selectedProductId)] };
      await exchangeApi.counterProposal(id, requestDto);
      alert('Контрпропозицію успішно надіслано!');
      navigate('/exchange/outgoing');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      alert(`Помилка: ${serverMsg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getProductNames = (ids) => {
    if (!ids || ids.length === 0) return 'Товари відсутні';
    return ids.map(pid => productsMap[pid] || `ID: ${pid}`).join(', ');
  };

  if (authLoading || loadingData) return <div className="cp-container"><p className="cp-message">Завантаження...</p></div>;
  
  if (error) {
    return (
      <div className="cp-container">
         <p className="cp-message error">{error}</p>
         <button onClick={() => navigate(-1)} className="cp-back-btn">Назад</button>
      </div>
    );
  }

  return (
    <div className="cp-container">
      <button onClick={() => navigate(-1)} className="cp-back-btn">Скасувати</button>

      <h2>Створення контрпропозиції</h2>
      
      <div className="cp-info-wrapper">
        <p className="cp-shipping-note">
          Ви пропонуєте свій товар замість попередніх умов.
        </p>
        
        <div className="cp-products-box">
           <h4>Товари, які ви отримаєте (від ініціатора):</h4>
           <p className="cp-product-text">
             {getProductNames(proposal.productFromId)}
           </p>
        </div>
      </div>

      <div className="cp-select-section">
        <h3>Оберіть ваш товар для обміну:</h3>
        
        {myProducts.length === 0 ? (
          <p className="cp-empty-warning">
            У вас немає товарів, доступних для обміну (Trade: Tak, Sale: Ні).
          </p>
        ) : (
          <select 
            className="cp-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Оберіть товар зі списку --</option>
            {myProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="cp-actions">
        <button 
          className="cp-submit-btn"
          onClick={handleSubmit}
          disabled={!selectedProductId || submitLoading}
        >
          {submitLoading ? 'Обробка...' : 'Надіслати контрпропозицію'}
        </button>
      </div>
    </div>
  );
};

export default CounterProposal;