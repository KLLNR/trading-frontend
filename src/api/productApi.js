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
};

export default productApi;