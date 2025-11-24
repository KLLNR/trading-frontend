import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext();

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithToken = (userData, token) => {
    if (!token) return userData;
    
    const decoded = parseJwt(token);
    if (decoded?.id) {
       return { ...userData, id: decoded.id };
    }
    return userData;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token) {
        let currentUser = storedUser ? JSON.parse(storedUser) : null;

        const decoded = parseJwt(token);
        if (decoded && decoded.id) {
           currentUser = currentUser ? { ...currentUser, id: decoded.id } : { id: decoded.id, email: decoded.sub };
           setUser(currentUser);
        }

        try {
          const userProfile = await authApi.getProfile();
          const fullUser = syncUserWithToken(userProfile, token);
          
          setUser(fullUser);
          localStorage.setItem('user', JSON.stringify(fullUser));
        } catch (error) {
          console.error('Auth check failed', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (signInData) => {
    try {
      const response = await authApi.login(signInData);
      const token = response.token || response.data?.token;
      
      if (token) {
        localStorage.setItem('token', token);
        
        const decoded = parseJwt(token);
        console.log("Decoded Token on Login:", decoded); 
        
        let userObj = { id: decoded.id, email: decoded.sub };
        setUser(userObj);

        try {
            const profile = await authApi.getProfile();
            userObj = { ...profile, id: decoded.id }; 
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
        } catch (e) {
            console.warn("Could not fetch full profile, using token data");
        }

        return { success: true };
      }
      
      return { success: false, error: "Токен не отримано" };

    } catch (error) {
      throw new Error(error.message || 'Помилка входу');
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);