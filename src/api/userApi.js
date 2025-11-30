import axiosClient from './axiosInstance'; 

const userApi = {
  getUserById: async (userId) => {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data;
  },
};

export default userApi;