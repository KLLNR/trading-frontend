import React, { useState } from 'react';
import { userApi, CATEGORIES } from '../api/userApi';
import '../styles/AddProduct.css';

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    title: '',
    count: 1,
    description: '',
    image_url: [],
    category: '',
    contactInfo: '',
    is_for_trade: true,
    is_for_sale: false,
    price: '',
  });

  const [previewImages, setPreviewImages] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.image_url.length > 5) {
      alert('Максимум 5 фото!');
      return;
    }

    const readers = files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then((newImages) => {
      setNewProduct(prev => ({ ...prev, image_url: [...prev.image_url, ...newImages] }));
      setPreviewImages(prev => [...prev, ...newImages]);
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      alert('Будь ласка, увійдіть у систему.');
      return;
    }

    const productToAdd = {
      ...newProduct,
      owner_id: currentUser.id,
      price: newProduct.is_for_sale ? Number(newProduct.price) : 0,
    };

    try {
      await userApi.addProduct(productToAdd);
      alert('Товар додано!');

      setNewProduct({
        title: '',
        count: 1,
        description: '',
        image_url: [],
        category: '',
        contactInfo: '',
        is_for_trade: true,
        is_for_sale: false,
        price: '',
      });
      setPreviewImages([]);
    } catch (error) {
      console.error('Помилка при додаванні товару:', error);
      alert('Помилка при додаванні товару');
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Додати новий товар</h2>
      <form className="add-product-form" onSubmit={handleAddProduct}>
        <label className="add-product-label">Назва товару</label>
        <input
          type="text"
          className="add-product-input"
          placeholder="Назва товару"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          required
        />

        <label className="add-product-label">Кількість</label>
        <input
          type="number"
          className="add-product-input"
          min="1"
          value={newProduct.count}
          onChange={(e) => setNewProduct({ ...newProduct, count: Number(e.target.value) })}
          required
        />

        <label className="add-product-label">Опис товару</label>
        <textarea
          className="add-product-textarea"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          rows={5}
          maxLength={9000}
          placeholder="Опис"
          required
        />
        <p className="add-product-charcount">{newProduct.description.length} / 9000</p>

        <label className="add-product-label">Фото</label>
        <input
          type="file"
          className="add-product-file-input"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <p className="add-product-info">Завантажено фото: {newProduct.image_url.length} (макс. 5)</p>
        <div className="preview-images">
          {previewImages.map((img, idx) => (
            <img key={idx} src={img} alt={`Попередній перегляд ${idx + 1}`} className="preview-image" />
          ))}
        </div>

        <label className="add-product-label">Категорія</label>
        <select
          className="add-product-select"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="add-product-label">Тип товару</label>
        <div className="add-product-type">
          <label>
            <input
              type="radio"
              name="type"
              checked={newProduct.is_for_trade}
              onChange={() => setNewProduct({ ...newProduct, is_for_trade: true, is_for_sale: false, price: '' })}
            />
            На обмін
          </label>
          <label>
            <input
              type="radio"
              name="type"
              checked={newProduct.is_for_sale}
              onChange={() => setNewProduct({ ...newProduct, is_for_sale: true, is_for_trade: false })}
            />
            На продаж
          </label>
        </div>

        {newProduct.is_for_sale && (
          <>
            <label className="add-product-label">Ціна (грн)</label>
            <input
              type="number"
              min="1"
              className="add-product-input"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
            />
          </>
        )}

        <label className="add-product-label">Контактна інформація</label>
        <input
          type="text"
          className="add-product-input"
          placeholder="email або телефон"
          value={newProduct.contactInfo}
          onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
          required
        />

        <button type="submit" className="add-product-button">Додати товар</button>
      </form>
    </div>
  );
};

export default AddProduct;
