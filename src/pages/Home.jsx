import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, updateProfile } = useAuth();
  const [editFirstName, setEditFirstName] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updatedData = {
      firstName: editFirstName || user.firstName, // Зберігаємо введене ім’я
      lastName: editFirstName ? '' : user.lastName, // Очищаємо lastName, якщо введено нове ім’я
      avatar: previewAvatar || user.avatar,
    };
    const result = await updateProfile(updatedData);
    if (result.success) {
      alert('Профіль оновлено!');
      setEditFirstName(''); // Очищаємо поле
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      <h1>Ласкаво просимо!</h1>
      {user ? (
        <div>
          <p>Ім’я: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Адреса: {user.address?.street}, {user.address?.city}</p>
          {user.avatar && (
            <img src={user.avatar} alt="Аватар" style={{ width: '150px', height: '150px' }} />
          )}
          <form onSubmit={handleUpdateProfile}>
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
            {previewAvatar && (
              <img src={previewAvatar} alt="Попередній перегляд аватара" style={{ width: '150px', height: '150px', marginTop: '10px' }} />
            )}
            <button type="submit">Оновити профіль</button>
          </form>
        </div>
      ) : (
        <p>Будь ласка, увійдіть.</p>
      )}
    </div>
  );
};

export default Home;