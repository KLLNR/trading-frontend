import axiosClient from './axiosInstance';

const paymentApi = {
  createPayment: async (productId) => {
    try {
      const response = await axiosClient.post(`/payments/${productId}`);
      return response.data; 
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default paymentApi;