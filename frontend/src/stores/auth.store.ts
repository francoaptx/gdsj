import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import router from '@/router';

interface User {
  id: string;
  username: string;
  fullName: string;
  position: string;
  office: string;
  isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    returnUrl: null as string | null,
  }),

  getters: {
    // 👇 ESTE ES EL GETTER QUE FALTA
    isAuthenticated: (state) => !!state.user && !!state.token,
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authService.login(username, password);
        this.token = response.data.access_token;
        localStorage.setItem('token', this.token!);
        await this.fetchProfile();
        router.push(this.returnUrl || '/');
      } catch (error) {
        console.error('Error de login:', error);
        throw error; // Para que el componente de login pueda manejarlo
      }
    },

    async fetchProfile() {
      if (this.token) {
        try {
          const response = await authService.getProfile();
          this.user = response.data;
        } catch (error) {
          this.logout(); // Si el token es inválido, cerramos sesión
        }
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      router.push('/login');
    },
  },
});