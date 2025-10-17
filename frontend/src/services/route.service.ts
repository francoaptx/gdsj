import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
 
 export const routeService = {
   createRoute(routeData: any, attachment?: File) {
     const formData = new FormData();
 
     Object.keys(routeData).forEach(key => {
       formData.append(key, routeData[key]);
     });
 
     if (attachment) {
       // El backend en route.controller espera 'file'
       formData.append('file', attachment);
     }
 
     return axios.post(`${API_URL}/routes`, formData);
   },
 
   getUploadedDocuments() {
     return axios.get(`${API_URL}/documents/my-documents`);
   },
 
   getUsers() {
     return axios.get(`${import.meta.env.VITE_API_URL}/users/recipients`);
   },
 
   getSentRoutes() {
     return axios.get(`${API_URL}/routes/sent`);
   },
 
   downloadPdf(routeId: string) {
     return axios.get(`${API_URL}/routes/${routeId}/pdf`, { responseType: 'blob' });
   },
 
   cancelRoute(routeId: string) {
     return axios.delete(`${API_URL}/routes/${routeId}/cancel`);
   },
 
   sendCopy(routeId: string, recipientId: string) {
     return axios.post(`${API_URL}/routes/${routeId}/copy`, { recipientId });
   },
 
   getIncomingRoutes() {
     return axios.get(`${API_URL}/routes/incoming`);
   },
 
   getPendingRoutes() {
     return axios.get(`${API_URL}/routes/pending`);
   },
 
   receiveRoute(routeId: string) {
     return axios.post(`${API_URL}/routes/${routeId}/receive`, {});
   },
 
   archiveRoute(routeId: string, data: { folder: string; observation: string }) {
     return axios.post(`${API_URL}/routes/${routeId}/archive`, data);
   },
 
   forwardRoute(routeId: string, data: { recipientId: string; instruction: string; documentId?: string }) {
     return axios.post(`${API_URL}/routes/${routeId}/forward`, data);
   },
 
   getArchivedRoutes() {
     return axios.get(`${API_URL}/routes/archived`);
   },
 
   unarchiveRoute(routeId: string) {
     return axios.post(`${API_URL}/routes/${routeId}/unarchive`, {});
   },
 
   getRouteHistory(routeId: string) {
     return axios.get(`${API_URL}/routes/${routeId}/history`);
   },
 
   groupRoutes(data: { routeIds: string[]; mainRouteId: string }) {
     return axios.post(`${API_URL}/routes/group`, data);
   },
 
   ungroupRoutes(groupId: string) {
     return axios.post(`${API_URL}/routes/ungroup/${groupId}`, {});
   },
 
   downloadGroupCover(groupId: string) {
     return axios.get(`${API_URL}/routes/group/${groupId}/cover`, { responseType: 'blob' });
   },
 
   searchRoutes(query: string) {
     return axios.get(`${API_URL}/routes/search?q=${query}`);
   },
 };