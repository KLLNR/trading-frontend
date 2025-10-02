import axiosClient from './axiosInstance';

// Ручний перемикач: true для моку, false для реального бекенду
const USE_MOCK = true;

export const userApi = {
  login: async (signInData) => {
    if (USE_MOCK) {
      if (signInData.email === 'test@example.com' && signInData.password === 'password123') {
        const mockUser = {
          id: 1,
          firstName: 'Тест',
          lastName: 'Користувач',
          email: 'test@example.com',
          phone: '+380123456789',
          address: { street: 'вул. Тестова', city: 'Київ' },
          avatar: 'https://via.placeholder.com/150',
        };
        const mockToken = 'mock-token-123';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
      }
      throw new Error('Невірний email або пароль');
    }
    try {
      const response = await axiosClient.post('/auth/login', signInData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      const userResponse = await axiosClient.get('/users/me');
      const user = userResponse.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка логіну';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('user')) || null;
    }
    const response = await axiosClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const { firstName, lastName, avatar } = profileData;
        const updatedUser = {
          ...storedUser,
          firstName: firstName || storedUser.firstName,
          lastName: lastName || storedUser.lastName,
          avatar: avatar || storedUser.avatar,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Користувач не знайдений');
    }
    const response = await axiosClient.put('/users/me', profileData);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  updateAddress: async (addressData) => {
    if (USE_MOCK) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const updatedUser = { ...storedUser, address: addressData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Користувач не знайдений');
    }
    const response = await axiosClient.put('/users/me/address', addressData);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  getProducts: async () => {
    if (USE_MOCK) {
      return [
        { id: 1, name: 'Товар 1', price: 100 },
        { id: 2, name: 'Товар 2', price: 200 },
      ];
    }
    const response = await axiosClient.get('/api/products');
    return response.data;
  },
};