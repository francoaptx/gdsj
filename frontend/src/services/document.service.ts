import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const documentService = {
  createDraft(documentData: any) {
    return axios.post(`${API_URL}/documents/draft`, documentData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },

  downloadTemplate(documentId: string) {
    return axios.get(`${API_URL}/documents/${documentId}/template`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob'
    });
  },
    // Agregar método
    uploadFinalDocument(documentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`${API_URL}/documents/${documentId}/upload`, formData, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
        },
    });
    }
};