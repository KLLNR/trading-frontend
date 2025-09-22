import axiosClient from './axiosInstance';

export const userApi = {
  register: async (signUpData) => {
    const response = await axiosClient.post('/auth/register', signUpData);
    return response.data; // UserResponseDto
  },

  login: async (signInData) => {
    if (signInData.email === 'test@example.com' && signInData.password === 'password123') {
      const mockUser = {
        id: 1,
        firstName: 'Тест',
        lastName: 'Користувач',
        email: 'test@example.com',
        phone: '+380123456789',
        address: { street: 'вул. Тестова', city: 'Київ' },
      };
      const mockToken = 'mock-token-123';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return mockUser;
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
    const response = await axiosClient.get('/users/me');
    return response.data; // UserResponseDto
  },

  updateProfile: async (updateData) => {
    const response = await axiosClient.put('/users/me', updateData);
    return response.data;
  },

  updateAddress: async (addressData) => {
    const response = await axiosClient.put('/users/me/address', addressData);
    return response.data;
  },
};