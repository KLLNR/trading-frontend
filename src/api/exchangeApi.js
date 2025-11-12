import axiosClient from './axiosInstance';

const USE_MOCK = false;

export const exchangeApi = {
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
      const exchange = exchanges.find((e) => Number(e.id) === Number(id));
      if (!exchange) throw new Error('Обмін не знайдено');
      return exchange;
    }

    const response = await axiosClient.get(`/exchange/${id}`);
    return response.data;
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

export default exchangeApi;