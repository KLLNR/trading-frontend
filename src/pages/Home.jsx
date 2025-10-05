import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import '../styles/Home.css';

const Home = () => {
  const { user, updateProfile } = useAuth();
  const [editFirstName, setEditFirstName] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');
  const [userProducts, setUserProducts] = useState([]);

  const fetchUserProducts = useCallback(async () => {
    if (!user) return;
    const allProducts = await userApi.getProducts();
    const myProducts = allProducts.filter((p) => p.ownerId === user.id); 
    setUserProducts(myProducts);
  }, [user]);

  useEffect(() => {
    fetchUserProducts();
  }, [fetchUserProducts]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedData = {
      firstName: editFirstName || user.firstName,
      lastName: user.lastName,
      avatar: previewAvatar || user.avatar,
    };
    try {
      const result = await updateProfile(updatedData);
      if (result) {
        alert('Профіль оновлено!');
        setEditFirstName(''); 
      }
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      alert('Помилка оновлення профілю.');
    }
  };

  if (!user) return <p style={{ textAlign: 'center' }}>Будь ласка, увійдіть.</p>;

  return (
    <div className="home-container">
      <h1>Профіль користувача</h1>
      <div className="user-info">
        {user.avatar && <img src={user.avatar} alt="Аватар" className="user-avatar" />}
        <div className="user-details">
          <p><strong>Ім’я:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Телефон:</strong> {user.phone}</p>
          <p><strong>Адреса:</strong> {user.address?.street || '-'}, {user.address?.city || '-'}</p>
        </div>
      </div>
      <form className="edit-profile" onSubmit={handleUpdateProfile}>
        <input
          type="text"
          placeholder="Нове ім’я"
          value={editFirstName}
          onChange={(e) => setEditFirstName(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewAvatar && (
          <img src={previewAvatar} alt="Попередній перегляд аватара" className="preview-avatar" />
        )}
        <button type="submit">Оновити профіль</button>
      </form>
      <h2>Мої товари</h2>
      {userProducts.length === 0 ? (
        <p>Ви ще не додали жодного товару.</p>
      ) : (
        <div className="user-products">
          {userProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="product-card-link">
              <div className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Кількість: {product.count} шт</p>
                {product.images[0] && (
                  <img src={product.images[0]} alt={product.name} className="product-image" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;