import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/catalogs`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const catalogService = {
  getAll(catalog: string) {
    return axios.get(`${API_URL}/${catalog}`, getAuthHeaders());
  },
  create(catalog: string, name: string) {
    return axios.post(`${API_URL}/${catalog}`, { name }, getAuthHeaders());
  },
  update(catalog: string, id: string, name: string) {
    return axios.patch(`${API_URL}/${catalog}/${id}`, { name }, getAuthHeaders());
  },
  remove(catalog: string, id: string) {
    return axios.delete(`${API_URL}/${catalog}/${id}`, getAuthHeaders());
  },
};