import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Шукаємо токен у localStorage
    let token = localStorage.getItem('token');

    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token || user.accessToken || user.jwt; 
        } catch (e) {
          console.error('Помилка парсингу user в axios:', e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Якщо запит успішний (2xx), просто повертаємо дані
    return response;
  },
  (error) => {    
    if (error.response && error.response.status === 401) {
      console.warn('Токен недійсний або термін дії минув. Вихід...');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export default axiosClient;