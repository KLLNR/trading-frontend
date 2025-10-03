import axiosClient from './axiosInstance';

// Ручний перемикач: true для моку, false для реального бекенду
const USE_MOCK = true;

export const CATEGORIES = [
  'Електроніка',
  'Одяг',
  'Їжа',
  'Спорт',
  'Інше',
];

export const userApi = {

  register: async (signUpData) => {
    if (USE_MOCK) {
      const newUser = {
        id: Math.floor(Math.random() * 1000), 
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        phone: signUpData.phone,
        address: signUpData.address,
        avatar: 'https://via.placeholder.com/150',
      };
      const mockToken = 'mock-token-' + newUser.id;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    }
    const response = await axiosClient.post('/auth/register', signUpData);
    return response.data;
  },

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
        if (!localStorage.getItem('products')) {
          localStorage.setItem('products', JSON.stringify([{ id: 1, name: 'Товар 1', price: 100, description: 'Опис товару 1' }]));
        }
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
      const storedProducts = JSON.parse(localStorage.getItem('products'));
      console.log('Products from localStorage:', storedProducts); // Дебаг
      return storedProducts || [];
    }
    const response = await axiosClient.get('/api/products');
    return response.data;
  },

  addProduct: async (productData) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const newProduct = {
        id: Math.floor(Math.random() * 1000),
        name: productData.name,
        price: productData.count,
        description: productData.description,
        image: productData.image || 'https://via.placeholder.com/150',
        category: productData.category || 'Інше',
        contactInfo: productData.contactInfo || 'Немає даних',
      };
      const updatedProducts = [...storedProducts, newProduct];
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return newProduct;
    }
    const response = await axiosClient.post('/api/products', productData);
    return response.data;
  },
};