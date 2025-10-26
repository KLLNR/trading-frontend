import axiosClient from './axiosInstance';

const exchangeApi = {
  proposeExchange: (data) => axiosClient.post('/exchange/propose', data),
  getExchangeDetail: (id) => axiosClient.get(`/exchange/${id}`),
  acceptExchange: (id) => axiosClient.post(`/exchange/${id}/accept`),
  rejectExchange: (id) => axiosClient.post(`/exchange/${id}/reject`),
  getIncoming: () => axiosClient.get('/exchange/incoming'),
  getOutgoing: () => axiosClient.get('/exchange/outgoing'),
};

export default exchangeApi;
