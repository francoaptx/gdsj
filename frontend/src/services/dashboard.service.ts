// coinssjj/frontend/src/services/dashboard.service.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  /**
   * Obtiene los datos del dashboard desde el backend
   * Incluye: contadores, datos del gráfico y notificaciones
   */
  getDashboardData() {
    return axios.get(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};