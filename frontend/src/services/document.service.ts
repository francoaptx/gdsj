import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const documentService = {
  createDraft(documentData: any) {
    return axios.post(`${API_URL}/documents/draft`, documentData);
  },
    uploadFinalDocument(documentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(`${API_URL}/documents/${documentId}/upload`, formData);
    },
    uploadTemplate(templateFile: File) {
    const formData = new FormData();
    formData.append('template', templateFile);

    return axios.post(`${API_URL}/templates/upload`, formData);
    },
    downloadGeneratedDocument(docId: string) {
    return axios.get(`${API_URL}/documents/${docId}/download`, { responseType: 'blob' })
      .then(response => response.data);
    }
};