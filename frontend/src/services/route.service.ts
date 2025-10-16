import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const routeService = {
  createRoute(routeData: any, attachment?: File) {
    const formData = new FormData();

    // El backend espera los campos en el body, no dentro de un campo 'data'
    Object.keys(routeData).forEach(key => {
      formData.append(key, routeData[key]);
    });

    if (attachment) {
      formData.append('simpleAttachment', attachment);
    }

    return axios.post(`${API_URL}/routes`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getUploadedDocuments() {
    // Endpoint para listar documentos del usuario (necesita ser creado en el backend)
    return axios.get(`${API_URL}/documents/my-documents`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  getUsers() {
    // Llama al endpoint real de usuarios
    return axios.get(`${import.meta.env.VITE_API_URL}/users/recipients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  // Agregar métodos
  getSentRoutes() {
    return axios.get(`${API_URL}/routes/sent`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  downloadPdf(routeId: string) {
    return axios.get(`${API_URL}/routes/${routeId}/pdf`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob',
    });
  },

  cancelRoute(routeId: string) {
    return axios.delete(`${API_URL}/routes/${routeId}/cancel`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  sendCopy(routeId: string, recipientId: string) {
    return axios.post(
      `${API_URL}/routes/${routeId}/copy`,
      { recipientId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    );
  },

  getIncomingRoutes() {
    // Apuntamos al endpoint que sabemos que existe para la bandeja de entrada.
    return axios.get(`${API_URL}/routes/incoming`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  getPendingRoutes() {
    return axios.get(`${API_URL}/routes/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  receiveRoute(routeId: string) {
    return axios.post(`${API_URL}/routes/${routeId}/receive`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  archiveRoute(routeId: string, data: { folder: string; observation: string }) {
    return axios.post(`${API_URL}/routes/${routeId}/archive`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  forwardRoute(routeId: string, data: { recipientId: string; instruction: string; documentId?: string }) {
    return axios.post(`${API_URL}/routes/${routeId}/forward`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  getArchivedRoutes() {
    return axios.get(`${API_URL}/routes/archived`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  unarchiveRoute(routeId: string) {
    return axios.post(`${API_URL}/routes/${routeId}/unarchive`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  getRouteHistory(routeId: string) {
    return axios.get(`${API_URL}/routes/${routeId}/history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  groupRoutes(data: { routeIds: string[]; mainRouteId: string }) {
    return axios.post(`${API_URL}/routes/group`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  ungroupRoutes(groupId: string) {
    return axios.post(`${API_URL}/routes/ungroup/${groupId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  downloadGroupCover(groupId: string) {
    return axios.get(`${API_URL}/routes/group/${groupId}/cover`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob',
    });
  },

  searchRoutes(query: string) {
    return axios.get(`${API_URL}/routes/search?q=${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },
};