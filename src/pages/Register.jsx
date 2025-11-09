import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: {
      country: '',
      city: '',
      postalCode: '',
      street: ''
    }
  });
  const [error, setError] = useState('');
  const { register, user } = useAuth();      // ДОДАЛИ user
  const navigate = useNavigate();

  // Якщо користувач уже залогінений (наприклад, після реєстрації) — одразу на Home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['country', 'city', 'postalCode', 'street'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (password.length < 8 || password.length > 16) {
      setError('Пароль має бути від 8 до 16 символів');
      return;
    }
    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    try {
      console.log('Sending registration data:', formData);
      await register(formData);

      // Гарантовано перекидаємо на головну (навіть якщо React ще не оновив user)
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Помилка реєстрації');
    }
  };

  return (
    <div className="register-container">
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Пароль" required />
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Підтвердіть пароль" required />
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Телефон" required />
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ім'я" required />
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Прізвище" required />
        <input type="text" name="country" value={formData.address.country} onChange={handleChange} placeholder="Країна" required />
        <input type="text" name="city" value={formData.address.city} onChange={handleChange} placeholder="Місто" required />
        <input type="text" name="postalCode" value={formData.address.postalCode} onChange={handleChange} placeholder="Поштовий індекс" required />
        <input type="text" name="street" value={formData.address.street} onChange={handleChange} placeholder="Вулиця" required />
        <button type="submit">Зареєструватися</button>
      </form>
      <p>Вже маєте акаунт? <a href="/login">Увійти</a></p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Register;