import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productApi from '../api/productApi';
import exchangeApi from '../api/exchangeApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ExchangePropose.css';

const ExchangePropose = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [myProducts, setMyProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [product, setProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const [myProdsResponse, targetProd] = await Promise.all([
          productApi.getUserProducts(user.id, { page: 0, size: 100 }), // Беремо всі товари
          productApi.getProductById(productId),
        ]);

        // Фільтруємо тільки товари на обмін (isForTrade: true, isForSale: false)
        const filteredMyProducts = (myProdsResponse.content || []).filter(p => 
          p.isForTrade === true && p.isForSale === false
        );

        setMyProducts(filteredMyProducts);
        setProduct(targetProd);
      } catch (err) {
        console.error('Помилка завантаження:', err);
        alert('Помилка при завантаженні даних. Спробуйте пізніше.');
      }
    };

    load();
  }, [user?.id, productId]);

  const handleSubmit = async () => {
    if (!selectedProduct) {
      alert('Оберіть товар для обміну');
      return;
    }
    setSubmitLoading(true);
    try {
      const requestDto = {
        toUserId: product.ownerId, 
        productFromId: [Number(selectedProduct)], 
        productToId: [Number(productId)], 
      };
      await exchangeApi.createProposal(requestDto);
      alert('Пропозиція надіслана!');
      navigate('/exchange/outgoing');
    } catch (err) {
      alert(err.message || 'Помилка надсилання пропозиції');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;
  if (!product) return <p className="exchange-message">Завантаження товару...</p>;

  return (
    <div className="exchange-propose-container fade-in">
      <h2>Запропонувати обмін</h2>
      <div className="product-card">
        <h3>{product.title}</h3>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.title} className="product-image" />
        )}
        <p>{product.description || 'Без опису'}</p>
      </div>
      <div className="select-section">
        <label htmlFor="productSelect">Оберіть свій товар для обміну:</label>
        <select
          id="productSelect"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="product-select"
        >
          <option value="">-- Оберіть товар --</option>
          {myProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
      <button
        className="submit-button"
        disabled={!selectedProduct || submitLoading}
        onClick={handleSubmit}
      >
        {submitLoading ? 'Надсилання...' : 'Запропонувати обмін'}
      </button>
    </div>
  );
};

export default ExchangePropose;