import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState({ street: '', city: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password.length > 16) {
      setError('Пароль має бути від 8 до 16 символів');
      return;
    }
    const signUpData = {
      email,
      password,
      phone,
      firstName,
      lastName,
      address,
    };
    const result = await register(signUpData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Помилка реєстрації');
    }
  };

  return (
    <div>
      <h2>Реєстрація</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Телефон"
          required
        />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ім'я"
          required
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Прізвище"
          required
        />
        <input
          type="text"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          placeholder="Вулиця"
          required
        />
        <input
          type="text"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          placeholder="Місто"
          required
        />
        <button type="submit">Зареєструватися</button>
      </form>
        <p>Вже маєте акаунт? <a href="/login">Увійти</a></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Register;