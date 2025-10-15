// src/services/auth.service.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  login(username: string, password: string) {
    return axios.post(`${API_URL}/auth/login`, { username, password });
  },

  getProfile() {
    return axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};