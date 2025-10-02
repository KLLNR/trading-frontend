import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../api/userApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null); // Явно скидаємо, якщо немає даних
      // Опціонально: редірект через window.location (але краще в App.js)
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await userApi.login(credentials);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Помилка логіну' };
    }
  };

  const logout = () => {
    userApi.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await userApi.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update profile failed:', error);
      return { success: false, error: error.message || 'Помилка оновлення профілю' };
    }
  };

  const updateAddress = async (addressData) => {
    try {
      const updatedUser = await userApi.updateAddress(addressData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update address failed:', error);
      return { success: false, error: error.message || 'Помилка оновлення' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, updateAddress, loading }}>
      {children}
    </AuthContext.Provider>
  );
};