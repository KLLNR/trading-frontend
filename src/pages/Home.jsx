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

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(3); 

  const fetchUserProducts = useCallback(async () => {
    if (!user) return;
    const allProducts = await userApi.getProducts();
    const myProducts = allProducts.filter((p) => p.owner_id === user.id);
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = userProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(userProducts.length / productsPerPage);

  return (
    <div className="home-container">
      <h1>Профіль користувача</h1>
      <div className="user-info">
        {user.avatar && <img src={user.avatar} alt="" className="user-avatar" />}
        <div className="user-details">
          <p><strong>Ім’я:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Телефон:</strong> {user.phone}</p>
          <p><strong>Адреса:</strong> {user.address?.street || '-'}, {user.address?.city || '-'}</p>
        </div>
      </div>

      <form className="edit-profile" onSubmit={handleUpdateProfile}>
  <h3 className="edit-profile-title">Редагування профілю</h3>

  <label htmlFor="firstName" className="edit-label">Нове ім’я:</label>
  <input
    id="firstName"
    type="text"
    placeholder="Введіть нове ім’я"
    value={editFirstName}
    onChange={(e) => setEditFirstName(e.target.value)}
  />

  <label htmlFor="avatarUpload" className="edit-label">Оновити аватар:</label>
  <input
    id="avatarUpload"
    type="file"
    accept="image/*"
    onChange={handleFileChange}
  />

  {previewAvatar && (
    <img src={previewAvatar} alt="" className="preview-avatar" />
  )}

  <button type="submit" className="update-btn">Оновити профіль</button>
</form>


      <h2>Мої товари</h2>
      {userProducts.length === 0 ? (
        <p>Ви ще не додали жодного товару.</p>
      ) : (
        <>
          <div className="user-products">
  {currentProducts.map((product) => (
    <Link key={product.id} to={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <h3>{product.title}</h3>
        {product.image_url?.[0] && (
          <img src={product.image_url[0]} alt={product.title} className="product-image" />
        )}
        {product.is_for_sale ? (
          <p className="price">Ціна: {product.price} грн</p>
        ) : (
          <p className="exchange">На обмін</p>
        )}
      </div>
    </Link>
  ))}
</div>


          <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Назад</button>
            <span>Сторінка {currentPage} з {totalPages}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Далі</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
