import axiosClient from './axiosInstance'; // Твій базовий axios з токеном

const exchangeApi = {
  createProposal: async (requestDto) => {
    try {
      const response = await axiosClient.post('/exchange', requestDto);
      return response.data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  cancelProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error canceling proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  acceptProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  rejectProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  counterProposal: async (proposalId, requestDto) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/counter`, requestDto);
      return response.data;
    } catch (error) {
      console.error('Error counter proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  getProposal: async (proposalId) => {
    try {
      const response = await axiosClient.get(`/exchange/${proposalId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting proposal:', error);
      throw error.response?.data || error.message;
    }
  },

  getIncomingProposals: async (params = { page: 0, size: 10 }) => {
    try {
      const response = await axiosClient.get('/exchange/incoming', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting incoming proposals:', error);
      throw error.response?.data || error.message;
    }
  },

  getOutgoingProposals: async (params = { page: 0, size: 10 }) => {
    try {
      const response = await axiosClient.get('/exchange/outgoing', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting outgoing proposals:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default exchangeApi;