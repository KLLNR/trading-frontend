import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { user, updateProfile } = useAuth();
  const [editFirstName, setEditFirstName] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedData = {
      firstName: editFirstName || user.firstName,
      lastName: editFirstName ? '' : user.lastName,
      avatar: previewAvatar || user.avatar,
    };
    const result = await updateProfile(updatedData);
    if (result.success) {
      alert('Профіль оновлено!');
      setEditFirstName('');
    } else {
      alert(result.error);
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
          <p><strong>Адреса:</strong> {user.address?.street}, {user.address?.city}</p>
        </div>
      </div>

      <form className="edit-profile" onSubmit={handleUpdateProfile}>
        <input
          type="text"
          placeholder="Нове ім’я"
          value={editFirstName}
          onChange={(e) => setEditFirstName(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {previewAvatar && <img src={previewAvatar} alt="Попередній перегляд аватара" className="preview-avatar" />}
        <button type="submit">Оновити профіль</button>
      </form>
    </div>
  );
};

export default Home;
