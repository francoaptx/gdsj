// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth.store';
import { setupAxiosInterceptors } from './services/axios.interceptor';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Configura el interceptor de Axios para todas las peticiones
setupAxiosInterceptors();

// Función asíncrona para inicializar la app
async function initializeApp() {
  const authStore = useAuthStore();
  try {
    // Si hay un token, intenta restaurar la sesión antes de montar la app
    if (authStore.token) {
      await authStore.fetchProfile();
    }
  } finally {
    // Montar la aplicación después de intentar restaurar la sesión
    app.mount('#app');
  }
}

initializeApp();