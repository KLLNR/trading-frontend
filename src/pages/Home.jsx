import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Ласкаво просимо!</h1>
      {user ? (
        <div>
          <p>Ім’я: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Адреса: {user.address?.street}, {user.address?.city}</p>
        </div>
      ) : (
        <p>Будь ласка, увійдіть.</p>
      )}
    </div>
  );
};

export default Home;