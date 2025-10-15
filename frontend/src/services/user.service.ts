import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const userService = {
  getAll() {
    return axios.get(API_URL, getAuthHeaders());
  },
  create(user: any) {
    return axios.post(API_URL, user, getAuthHeaders());
  },
  update(id: string, user: any) {
    return axios.patch(`${API_URL}/${id}`, user, getAuthHeaders());
  },
  remove(id: string) {
    return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },
};