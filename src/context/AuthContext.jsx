  import React, { createContext, useState, useEffect } from 'react';
  import { userApi } from '../api/userApi';

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const initializeAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // userApi.js вже має axiosClient, який автоматично додає токен у заголовки
            // Ми просто перевіряємо, чи токен ще дійсний, отримавши профіль
            const userProfile = await userApi.getProfile();
            setUser(userProfile);
            // Оновлюємо localStorage свіжими даними
            localStorage.setItem('user', JSON.stringify(userProfile));
          } catch (error) {
            // Якщо getProfile() повертає 401 або іншу помилку, токен недійсний
            console.error('Auth initialization error:', error);
            userApi.logout(); // Видаляємо невалідний токен і дані
            setUser(null);
          }
        }
        // Встановлюємо loading(false) ТІЛЬКИ ПІСЛЯ завершення перевірки
        setLoading(false);
      };
      initializeAuth();
    }, []);

    const register = async (signUpData) => {
      try {
        // Тепер userApi.register повертає user напряму або кидає помилку
        const user = await userApi.register(signUpData);
    
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      } catch (error) {
        console.error('Register error:', error);
        throw new Error(error.message || 'Помилка реєстрації');
      }
    };
    

    const login = async (signInData) => {
      try {
        const user = await userApi.login(signInData); // Тепер отримуємо user напряму
    
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Невірний email або пароль');
      }
    };

    const logout = () => {
      userApi.logout();
      setUser(null);
      localStorage.removeItem('user');
    };

    const updateProfile = async (profileData) => {
      try {
        const updatedUser = await userApi.updateProfile(profileData);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    };

    return (
      <AuthContext.Provider value={{ user, register, login, logout, updateProfile, loading }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => React.useContext(AuthContext);
