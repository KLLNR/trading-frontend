// src/api/userApi.js
import axiosClient from './axiosInstance';

// ------------------ ГОЛОВНИЙ ПЕРЕМИКАЧ ------------------
const USE_MOCK = true; // true — тільки локально, false — для реального бекенду

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
        name: `${signUpData.firstName} ${signUpData.lastName}`,
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

    try {
      const response = await axiosClient.post('/auth/register', signUpData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
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

        if (!localStorage.getItem('products')) {
          localStorage.setItem(
            'products',
            JSON.stringify([
              {
                id: 1,
                title: 'Товар 1',
                description: 'Опис товару 1',
                image_url: ['https://via.placeholder.com/150'],
                category: 'Електроніка',
                contactInfo: 'test@example.com',
                owner_id: mockUser.id,
                is_for_sale: true,
                is_for_trade: true,
                price: 100,
              },
            ])
          );
        }

        return mockUser;
      }
      throw new Error('Невірний email або пароль');
    }

    try {
      const response = await axiosClient.post('/auth/login', signInData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
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
    localStorage.removeItem('exchanges');
    localStorage.removeItem('products');
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

  getProducts: async () => {
    if (USE_MOCK) return JSON.parse(localStorage.getItem('products')) || [];

    try {
      const response = await axiosClient.get('/products');
      return response.data;
    } catch (error) {
      console.error('Get products error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка отримання товарів';
    }
  },

  addProduct: async (productData) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const storedUser = JSON.parse(localStorage.getItem('user'));

      const newProduct = {
        id: Math.floor(Math.random() * 100000),
        title: productData.title,
        description: productData.description,
        image_url: Array.isArray(productData.image_url)
          ? productData.image_url
          : [productData.image_url],
        category: productData.category,
        contactInfo: productData.contactInfo || storedUser.email,
        owner_id: storedUser.id,
        is_for_trade: productData.is_for_trade,
        is_for_sale: productData.is_for_sale,
        price: productData.is_for_sale ? Number(productData.price) : 0,
        count: productData.count ?? 1,
      };

      const updatedProducts = [...storedProducts, newProduct];
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return newProduct;
    }

    try {
      const response = await axiosClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Add product error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка додавання товару';
    }
  },

  updateProduct: async (productId, productData) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const updatedProducts = storedProducts.map((p) =>
        p.id === Number(productId) ? { ...p, ...productData } : p
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return updatedProducts.find((p) => p.id === Number(productId));
    }

    try {
      const response = await axiosClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Update product error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка оновлення товару';
    }
  },

  deleteProduct: async (productId) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const updatedProducts = storedProducts.filter((p) => p.id !== Number(productId));
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return true;
    }

    try {
      await axiosClient.delete(`/products/${productId}`);
      return true;
    } catch (error) {
      console.error('Delete product error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка видалення товару';
    }
  },

  proposeExchange: async (payload) => {
    if (USE_MOCK) {
      const storedExchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
      const newExchange = {
        ...payload,
        id: Math.floor(Math.random() * 1000),
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('exchanges', JSON.stringify([...storedExchanges, newExchange]));
      return newExchange;
    }

    const response = await axiosClient.post('/exchange/propose', payload);
    return response.data;
  },

  acceptExchange: async (id) => {
    if (USE_MOCK) {
      const storedExchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
      const updated = storedExchanges.map((e) =>
        e.id === id ? { ...e, status: 'ACCEPTED' } : e
      );
      localStorage.setItem('exchanges', JSON.stringify(updated));
      return updated.find((e) => e.id === id);
    }

    const response = await axiosClient.post(`/exchange/${id}/accept`);
    return response.data;
  },

  rejectExchange: async (id) => {
    if (USE_MOCK) {
      const storedExchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
      const updated = storedExchanges.map((e) =>
        e.id === id ? { ...e, status: 'REJECTED' } : e
      );
      localStorage.setItem('exchanges', JSON.stringify(updated));
      return updated.find((e) => e.id === id);
    }

    const response = await axiosClient.post(`/exchange/${id}/reject`);
    return response.data;
  },

  getExchangeById: async (id) => {
    if (USE_MOCK) {
      const exchanges = JSON.parse(localStorage.getItem('exchanges')) || [];
      const exchange = exchanges.find((e) => e.id === id);
      if (!exchange) throw new Error('Обмін не знайдено');
      return exchange;
    }
  
    try {
      const response = await axiosClient.get(`/exchange/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get exchange by ID error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка отримання деталей обміну';
    }
  },
  

  getIncomingExchanges: async () => {
    if (USE_MOCK) {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      return (JSON.parse(localStorage.getItem('exchanges')) || []).filter(
        (e) => e.to_user_id === userId
      );
    }

    const response = await axiosClient.get('/exchange/incoming');
    return response.data;
  },

  getOutgoingExchanges: async () => {
    if (USE_MOCK) {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      return (JSON.parse(localStorage.getItem('exchanges')) || []).filter(
        (e) => e.from_user_id === userId
      );
    }

    const response = await axiosClient.get('/exchange/outgoing');
    return response.data;
  },
};

export default userApi;
