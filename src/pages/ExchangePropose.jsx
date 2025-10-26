// src/pages/ExchangePropose.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';

const ExchangePropose = () => {
  const { productId } = useParams(); // товар користувача Б
  const navigate = useNavigate();

  const [targetProduct, setTargetProduct] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [selectedMyProductId, setSelectedMyProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await userApi.getProducts();
        const target = allProducts.find(p => p.id === Number(productId));
        const mine = allProducts.filter(p => p.owner_id === currentUser.id);

        setTargetProduct(target);
        setMyProducts(mine);
      } catch (err) {
        console.error('Помилка завантаження товарів:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [productId]);

  const handlePropose = async () => {
    if (!selectedMyProductId) return alert('Оберіть ваш товар для обміну.');
    if (targetProduct.owner_id === currentUser.id) return alert('Не можна обміняти свій товар на свій.');
    
    setSubmitting(true);
  
    try {
      const payload = {
        from_user_id: currentUser.id,
        to_user_id: targetProduct.owner_id,
        product_from_id: selectedMyProductId,
        product_to_id: targetProduct.id,
      };
  
      const result = await userApi.proposeExchange(payload);
      alert('Пропозицію надіслано!');
      navigate(`/exchange/${result.id}`);
    } catch (err) {
      console.error('Помилка пропозиції обміну:', err);
      alert('Не вдалося створити пропозицію.');
    } finally {
      setSubmitting(false);
    }
  };
  

  if (loading) return <p className="text-center mt-4">Завантаження...</p>;
  if (!targetProduct) return <p className="text-center mt-4">Товар не знайдено.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Запропонувати обмін</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Товар користувача Б */}
        <div className="border p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">{targetProduct.title}</h3>
          <img src={targetProduct.image_url?.[0]} alt={targetProduct.title} className="w-full rounded-lg mb-2" />
          <p>{targetProduct.description}</p>
          <p className="text-sm text-gray-500 mt-2">Категорія: {targetProduct.category}</p>
        </div>

        {/* Мої товари для вибору */}
        <div className="border p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Оберіть свій товар</h3>
          <select
            className="w-full border rounded-lg p-2 mb-4"
            value={selectedMyProductId || ''}
            onChange={(e) => setSelectedMyProductId(Number(e.target.value))}
          >
            <option value="">-- Оберіть товар --</option>
            {myProducts.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            onClick={handlePropose}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Надсилання...' : 'Запропонувати обмін'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangePropose;
