// src/pages/ExchangeDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import userApi from '../api/userApi';

const ExchangeDetail = () => {
  const { id } = useParams();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const loadExchange = async () => {
    try {
      const data = await userApi.getExchangeById(Number(id));
      setExchange(data);
      const allProducts = await userApi.getProducts();
      setProducts(allProducts);
    } catch (err) {
      console.error('Помилка завантаження деталей обміну:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchange();
  }, [id]);

  const handleAccept = async () => {
    await userApi.acceptExchange(exchange.id);
    alert('Обмін прийнято!');
    loadExchange();
  };

  const handleReject = async () => {
    await userApi.rejectExchange(exchange.id);
    alert('Обмін відхилено.');
    loadExchange();
  };

  if (loading) return <p className="text-center mt-4">Завантаження...</p>;
  if (!exchange) return <p className="text-center mt-4">Обмін не знайдено.</p>;

  const fromProduct = products.find(p => p.id === exchange.product_from_id);
  const toProduct = products.find(p => p.id === exchange.to_product_id);

  const isReceiver = currentUser.id === exchange.to_user_id;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Деталі обміну</h2>
      <p className="text-center mb-2 text-gray-500">Статус: <b>{exchange.status}</b></p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="border p-4 rounded-lg">
          <h3 className="font-bold mb-2">Товар користувача А</h3>
          {fromProduct ? (
            <>
              <img src={fromProduct.image_url?.[0]} alt="" className="w-full rounded-lg mb-2" />
              <p>{fromProduct.title}</p>
              <p className="text-sm text-gray-500">{fromProduct.description}</p>
            </>
          ) : <p>Товар не знайдено</p>}
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="font-bold mb-2">Ваш товар</h3>
          {toProduct ? (
            <>
              <img src={toProduct.image_url?.[0]} alt="" className="w-full rounded-lg mb-2" />
              <p>{toProduct.title}</p>
              <p className="text-sm text-gray-500">{toProduct.description}</p>
            </>
          ) : <p>Товар не знайдено</p>}
        </div>
      </div>

      {isReceiver && exchange.status === 'PENDING' && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleAccept}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Прийняти
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Відхилити
          </button>
        </div>
      )}
    </div>
  );
};

export default ExchangeDetail;
