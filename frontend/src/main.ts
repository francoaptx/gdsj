// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Restaurar sesión si existe token
const authStore = useAuthStore();
if (authStore.token) {
  authStore.fetchProfile();
}

app.mount('#app');