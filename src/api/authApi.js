import axiosClient from './axiosInstance';

const USE_MOCK = false; // true — mock, false — реальний бекенд

export const authApi = {
  register: async (signUpData) => {
    if (USE_MOCK) {
      const newUser = {
        id: Math.floor(Math.random() * 1000),
        name: `${signUpData.firstName} ${signUpData.lastName}`,
        email: signUpData.email,
        phone: signUpData.phone,
        address: signUpData.address,
        avatar: 'https://via.placeholder.com/150',
      };
      const mockToken = 'mock-token-' + newUser.id;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { token: mockToken, user: newUser };
    }

    try {
      console.log("Реєстрація:", signUpData);
      const regResponse = await axiosClient.post('/auth/register', signUpData);
      console.log("Зареєстровано:", regResponse.data);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const loginResponse = await axiosClient.post('/auth/login', {
        email: signUpData.email,
        password: signUpData.password,
      });

      console.log("Успішний логін:", loginResponse.data);

      const token = typeof loginResponse.data === 'string'
        ? loginResponse.data
        : loginResponse.data.token;

      if (!token) {
        throw new Error('Токен не отримано');
      }

      localStorage.setItem('token', token);

      const profileResponse = await axiosClient.get('/users/me');
      const user = profileResponse.data;

      localStorage.setItem('user', JSON.stringify(user));

      // ВИПРАВЛЕНО: Повертаємо і токен, і юзера
      return { token, user }; 
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Помилка реєстрації');
    }
  },

  login: async (signInData) => {
    if (USE_MOCK) {
      if (signInData.email === 'test@example.com' && signInData.password === 'password123') {
        const mockUser = {
          id: 1,
          name: 'Тест Користувач',
          email: 'test@example.com',
          phone: '+380123456789',
          address: 'Київ, вул. Тестова',
          avatar: 'https://via.placeholder.com/150',
        };
        const mockToken = 'mock-token-123';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { token: mockToken, user: mockUser };
      }
      throw new Error('Невірний email або пароль');
    }

    try {
      const response = await axiosClient.post('/auth/login', signInData);
      console.log("Логін успішний:", response.data);

      const token = typeof response.data === 'string'
        ? response.data
        : response.data.token;

      if (!token) {
        throw new Error('Токен не отримано');
      }

      localStorage.setItem('token', token);

      const profileResponse = await axiosClient.get('/users/me');
      const user = profileResponse.data;

      localStorage.setItem('user', JSON.stringify(user));

      // ВИПРАВЛЕНО: Повертаємо об'єкт з токеном
      // AuthContext чекає response.token
      return { token, user };
      
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Невірний email або пароль');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    if (USE_MOCK) return JSON.parse(localStorage.getItem('user')) || null;
    try {
      const response = await axiosClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка отримання профілю';
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axiosClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) throw new Error('Користувач не знайдений');
      const updatedUser = { ...storedUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    try {
      const response = await axiosClient.put('/users/me', profileData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка оновлення профілю';
    }
  },

  updateAddress: async (addressData) => {
    if (USE_MOCK) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) throw new Error('Користувач не знайдений');
      const updatedUser = { ...storedUser, address: addressData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    try {
      const response = await axiosClient.put('/users/me/address', addressData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Update address error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка оновлення адреси';
    }
  },
};

export default authApi;