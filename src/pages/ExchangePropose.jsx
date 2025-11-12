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

  useEffect(() => {
    if (!user?.id) return;
  
    const load = async () => {
      try {
        const [myProds, targetProd] = await Promise.all([
          productApi.getMyProducts(),
          productApi.getProductById(productId),
        ]);
        setMyProducts(myProds);
        setProduct(targetProd);
      } catch (err) {
        console.error(err);
        alert('Помилка при завантаженні даних. Спробуйте пізніше.');
      }
    };
  
    load();
  }, [user?.id, productId]);
  

  if (loading) return <p className="exchange-message">Завантаження...</p>;
  if (!user) return <p className="exchange-message">Спочатку увійдіть у профіль</p>;
  if (!product) return <p className="exchange-message">Завантаження товару...</p>;

  const handleSubmit = async () => {
    await exchangeApi.createExchange({
      product_from_id: selectedProduct,
      product_to_id: product.id,
      to_user_id: product.owner_id
    });
    navigate('/exchange/outgoing');
  };

  return (
    <div className="exchange-propose-container fade-in">
      <h2>Запропонувати обмін</h2>

      <div className="product-card">
        <h3>{product.title}</h3>
        {product.image && (
          <img src={product.image} alt={product.title} className="product-image" />
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
        disabled={!selectedProduct}
        onClick={handleSubmit}
      >
        Запропонувати обмін
      </button>
    </div>
  );
};

export default ExchangePropose;
