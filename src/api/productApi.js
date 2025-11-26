import axiosClient from './axiosInstance';

const USE_MOCK = false;

export const productApi = {
  getMyProducts: async () => {
    if (USE_MOCK) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('Користувач не знайдений');
      const all = JSON.parse(localStorage.getItem('products')) || [];
      return all.filter(p => p.owner_id === user.id);
    }

    const response = await axiosClient.get('/products/my');
    return response.data;
  },

  getProductById: async (productId) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const product = storedProducts.find((p) => p.id === Number(productId));
      if (!product) throw new Error('Товар не знайдено');
      return product;
    }

    try {
      const response = await axiosClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Get product by ID error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Помилка отримання товару';
    }
  },

  getProducts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  searchProducts: async (keywords, page = 0, size = 12) => {
    const response = await axiosClient.get('/products/search', {
      params: { keywords, page, size, sort: 'id,desc' }
    });
    return response.data;
  },

  addProduct: async (productData) => {
    if (USE_MOCK) {
      const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const newProduct = {
        id: Math.floor(Math.random() * 100000),
        title: productData.title,
        description: productData.description,
        imageUrl: productData.imageUrl,
        categoryId: productData.categoryId,
        contactInfo: productData.contactInfo || storedUser.email,
        owner_id: storedUser.id,
        is_for_trade: productData.isForTrade,
        is_for_sale: productData.isForSale,
        price: productData.isForSale ? Number(productData.price) : 0,
      };
      localStorage.setItem('products', JSON.stringify([...storedProducts, newProduct]));
      return newProduct;
    }
  
    try {
      const response = await axiosClient.post('/products', productData, {
        headers: {
          'Content-Type': 'application/json', 
        },
      });
      return response.data;
    } catch (error) {
      console.error('Add product error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Помилка додавання товару');
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
};

export default productApi;