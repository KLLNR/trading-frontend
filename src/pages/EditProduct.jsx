import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../api/constants.js';
import { productApi } from '../api/productApi';
import '../styles/AddProduct.css'; // Або створи окремий CSS для Edit

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    categoryId: '',
    isForTrade: true,
    isForSale: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Увійдіть у систему для редагування.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const data = await productApi.getProductById(id);
        setProduct({
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          price: data.price || '',
          categoryId: data.category?.id || data.categoryId || '',
          isForTrade: data.isForTrade,
          isForSale: data.isForSale,
        });
      } catch (err) {
        const backendError = err.response?.data?.message || err.message || 'Невідома помилка';
        console.error('Error loading product:', err.response?.data || err.message);
        setError(backendError);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Увійдіть у систему для редагування.');
      setLoading(false);
      return;
    }

    // Валідація
    if (!product.title.trim() || !product.description.trim() || !product.categoryId || !product.imageUrl.trim()) {
      setError('Заповніть усі обов’язкові поля');
      setLoading(false);
      return;
    }
    if (product.isForSale && (!product.price || Number(product.price) <= 0)) {
      setError('Вкажіть ціну для продажу (більше 0 грн)');
      setLoading(false);
      return;
    }
    if (!product.imageUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      setError('Посилання на фото має закінчуватись на .jpg, .png, .gif тощо');
      setLoading(false);
      return;
    }

    try {
      const productToUpdate = {
        title: product.title.trim(),
        description: product.description.trim(),
        imageUrl: product.imageUrl.trim(),
        categoryId: Number(product.categoryId),
        isForTrade: product.isForTrade,
        isForSale: product.isForSale,
        ...(product.isForSale && { price: Number(product.price) }),
      };
      console.log('Оновлюємо товар:', productToUpdate);
      await productApi.updateProduct(id, productToUpdate);
      alert('Товар успішно оновлено!');
      navigate(`/product/${id}`);
    } catch (err) {
      const backendError = err.response?.status === 401 ? 'Токен недійсний. Увійдіть знову.' : (err.response?.data?.message || err.message || 'Невідома помилка');
      console.error('Помилка при оновленні товару:', err.response?.data || err.message);
      setError(backendError);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Завантаження товару...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Редагувати товар</h2>
      {error && <p className="error">{error}</p>}
      <form className="add-product-form" onSubmit={handleUpdateProduct}>
        <label>Назва товару *</label>
        <input
          type="text"
          value={product.title}
          onChange={(e) => setProduct({ ...product, title: e.target.value })}
          required
          disabled={loading}
        />
        <label>Опис товару *</label>
        <textarea
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          rows={5}
          maxLength={9000}
          required
          disabled={loading}
        />
        <p>{product.description.length} / 9000</p>
        <label>Посилання на фото (imgur, postimages.org тощо) *</label>
        <input
          type="url"
          value={product.imageUrl}
          onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
          placeholder="https://i.imgur.com/abc123.jpg"
          required
          disabled={loading}
        />
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt="Попередній перегляд"
            style={{ width: 200, height: 200, objectFit: 'cover', marginTop: 10, borderRadius: 8 }}
            onError={() => setError('Не вдалося завантажити фото — перевірте посилання')}
          />
        )}
        <label>Категорія *</label>
        <select
          value={product.categoryId}
          onChange={(e) => setProduct({ ...product, categoryId: Number(e.target.value) })}
          required
          disabled={loading}
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <label>Тип товару *</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={product.isForTrade}
              onChange={() => setProduct({ ...product, isForTrade: true, isForSale: false, price: '' })}
              disabled={loading}
            />
            На обмін
          </label>
          <label>
            <input
              type="radio"
              checked={product.isForSale}
              onChange={() => setProduct({ ...product, isForSale: true, isForTrade: false })}
              disabled={loading}
            />
            На продаж
          </label>
        </div>
        {product.isForSale && (
          <>
            <label>Ціна (грн) *</label>
            <input
              type="number"
              min="1"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              required
              disabled={loading}
            />
          </>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Оновлюємо...' : 'Зберегти зміни'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;