import axiosClient from './axiosInstance';

export const proposalApi = {
  createProposal: async (requestData) => {
    try {
      const response = await axiosClient.post('/exchange', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  acceptProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectProposal: async (proposalId) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/reject`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  counterProposal: async (proposalId, requestData) => {
    try {
      const response = await axiosClient.post(`/exchange/${proposalId}/counter`, requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProposal: async (proposalId) => {
    try {
      const response = await axiosClient.get(`/exchange/${proposalId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIncomingProposals: async (params = {}) => {
    try {
      const response = await axiosClient.get('/exchange/incoming', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOutgoingProposals: async (params = {}) => {
    try {
      const response = await axiosClient.get('/exchange/outgoing', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default proposalApi;