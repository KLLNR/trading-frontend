import React, { useState } from 'react';
import { userApi, CATEGORIES } from '../api/userApi';
import '../styles/AddProduct.css'; 

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    count: 0,
    description: '',
    images: [], 
    category: '',
    contactInfo: '',
  });
  const [previewImages, setPreviewImages] = useState([]); 

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      alert('Максимум 5 фото!');
      return;
    }
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((newImages) => {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ...newImages] });
      setPreviewImages([...previewImages, ...newImages]);
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const productWithUser = { ...newProduct, userId: currentUser.id }; 
    await userApi.addProduct(productWithUser);
    alert('Товар додано!');
    setNewProduct({
      name: '',
      count: 0,
      description: '',
      images: [],
      category: '',
      contactInfo: '',
    });
    setPreviewImages([]);
  };  

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Додати новий товар</h2>
      <form className="add-product-form" onSubmit={handleAddProduct}>

        <span className="add-product-label">Вкажіть назву</span>
        <input
          className="add-product-input"
          type="text"
          placeholder="Назва товару"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required
        />

        <span className="add-product-label">Вкажіть кількість</span>
        <input
          className="add-product-input"
          type="number"
          placeholder="Кількість"
          value={newProduct.count}
          onChange={(e) => setNewProduct({ ...newProduct, count: Number(e.target.value) })}
          required
        />

        <span className="add-product-label">Опис товару</span>
        <textarea
          className="add-product-textarea"
          placeholder="Опис"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          rows={5}
          maxLength={9000}
          required
        />
        <p className="add-product-charcount">
          {newProduct.description.length} / 9000
        </p>

        <span className="add-product-label">Фото</span>
        <input
          className="add-product-file-input"
          type="file"
          accept="image/*"
          multiple 
          onChange={handleFileChange}
        />
        <p className="add-product-info">Завантажено фото: {newProduct.images.length} (макс. 5)</p>
        <div className="preview-images">
          {previewImages.map((img, index) => (
            <img key={index} src={img} alt={`Попередній перегляд ${index + 1}`} className="preview-image" />
          ))}
        </div>

        <span className="add-product-label">Категорія</span>
        <select
          className="add-product-select"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          required
        >
          <option value="" disabled>Оберіть категорію</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <span className="add-product-label">Ваші контактні дані</span>
        <input
          className="add-product-input"
          type="text"
          placeholder="email/телефон"
          value={newProduct.contactInfo}
          onChange={(e) => setNewProduct({ ...newProduct, contactInfo: e.target.value })}
          required
        />

        <button className="add-product-button" type="submit">Додати товар</button>
      </form>
    </div>
  );
};

export default AddProduct;
