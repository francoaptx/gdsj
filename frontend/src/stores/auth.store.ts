// src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { username: string; isAdmin: boolean } | null,
    token: authService.getToken(),
  }),

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authService.login(username, password);
        this.token = response.data.access_token;
        authService.setToken(this.token);
        // Decodificar payload del JWT (simplificado)
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        this.user = {
          username: payload.username,
          isAdmin: payload.isAdmin,
        };
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Credenciales inválidas' };
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      authService.removeToken();
    },

    checkAuth() {
      if (this.token) {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        this.user = {
          username: payload.username,
          isAdmin: payload.isAdmin,
        };
      }
    }
  }
});