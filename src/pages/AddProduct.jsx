import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../api/constants.js';
import { productApi } from '../api/productApi';
import '../styles/AddProduct.css';

const MAX_DESCRIPTION_LENGTH = 255; 
const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    categoryId: '', 
    isForTrade: true,
    isForSale: false,
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (
      !newProduct.title.trim() ||
      !newProduct.description.trim() ||
      !newProduct.categoryId || 
      !newProduct.imageUrl.trim()
    ) {
      setError('Заповніть усі обов’язкові поля');
      setLoading(false);
      return;
    }

    if (newProduct.isForSale && (!newProduct.price || Number(newProduct.price) <= 0)) {
      setError('Вкажіть коректну ціну');
      setLoading(false);
      return;
    }

    try {
      const productToAdd = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim(),
        imageUrl: newProduct.imageUrl.trim(),
        categoryId: Number(newProduct.categoryId), 
        isForTrade: newProduct.isForTrade,
        isForSale: newProduct.isForSale,
        price: newProduct.isForSale ? Number(newProduct.price) : 0,
      };

      console.log('Sending product:', productToAdd); // Debugging log

      const created = await productApi.addProduct(productToAdd);

      alert('Товар додано!');
      navigate(`/product/${created.id}`);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не вдалося додати товар');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Додати новий товар</h2>

      {error && <p className="error">{error}</p>}

      <form className="add-product-form" onSubmit={handleAddProduct}>
        <label>Назва товару *</label>
        <input
          type="text"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          disabled={loading}
          placeholder="Наприклад: Ноутбук HP"
        />

<label>Опис *</label>
<textarea
  value={newProduct.description}
  onChange={(e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) { // Фізичне обмеження
      setNewProduct({ ...newProduct, description: value });
    }
  }}
  rows={5}
  maxLength={MAX_DESCRIPTION_LENGTH} // Запасний HTML-обмежувач
  disabled={loading}
  placeholder={`Опишіть стан та характеристики (макс ${MAX_DESCRIPTION_LENGTH} символів)...`}
/>

        <label>Посилання на фото *</label>
        <input
          type="url"
          value={newProduct.imageUrl}
          onChange={(e) =>
            setNewProduct({ ...newProduct, imageUrl: e.target.value })
          }
          disabled={loading}
          placeholder="https://..."
        />

        {newProduct.imageUrl && (
          <div className="image-preview-wrapper">
             <img
                src={newProduct.imageUrl}
                alt="preview"
                onError={(e) => {e.target.style.display = 'none'}} // Hide if link is broken
                style={{ width: 200, height: 200, objectFit: 'cover', marginTop: 10, borderRadius: 8 }}
             />
          </div>
        )}

        <label>Категорія *</label>
        <select
          value={newProduct.categoryId}
          onChange={(e) =>
            setNewProduct({ ...newProduct, categoryId: e.target.value })
          }
          disabled={loading}
        >
          <option value="" disabled>
            Оберіть категорію
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Тип *</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={newProduct.isForTrade}
              onChange={() =>
                setNewProduct({ ...newProduct, isForTrade: true, isForSale: false, price: '' })
              }
            />
            На обмін
          </label>

          <label>
            <input
              type="radio"
              checked={newProduct.isForSale}
              onChange={() =>
                setNewProduct({ ...newProduct, isForTrade: false, isForSale: true })
              }
            />
            На продаж
          </label>
        </div>

        {newProduct.isForSale && (
          <>
            <label>Ціна (грн) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              disabled={loading}
            />
          </>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Додаємо...' : 'Додати товар'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;