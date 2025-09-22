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
    if (token && storedUser) setUser(JSON.parse(storedUser));
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
    <AuthContext.Provider value={{ user, login, logout, updateAddress, loading }}>
      {children}
    </AuthContext.Provider>
  );
};