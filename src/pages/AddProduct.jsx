import React, { useState } from 'react';
import { userApi, CATEGORIES } from '../api/userApi';
import '../styles/AddProduct.css';

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    count: 0,
    description: '',
    image: '',
    category: '',
    contactInfo: '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await userApi.addProduct(newProduct);
    alert('Товар додано!');
    setNewProduct({
      name: '',
      count: 0,
      description: '',
      image: '',
      category: '',
      contactInfo: '',
    });
  };

  return (
    <div className="add-product-container">
      <h2>Додати новий товар</h2>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Назва товару"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Кількість"
          value={newProduct.count}
          onChange={(e) => setNewProduct({ ...newProduct, count: Number(e.target.value) })}
          required
        />
        <input
          type="text"
          placeholder="Опис"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          required
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {newProduct.image && <img src={newProduct.image} alt="Попередній перегляд" />}
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Контактні дані (email/телефон)"
          value={newProduct.contactInfo}
          onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
          required
        />
        <button type="submit">Додати товар</button>
      </form>
    </div>
  );
};

export default AddProduct;
