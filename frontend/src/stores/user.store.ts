import { defineStore } from 'pinia';
import { ref } from 'vue';
import { routeService } from '@/services/route.service';

export const useUserStore = defineStore('users', () => {
  const users = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Variable para asegurar que solo se carguen una vez
  const hasLoaded = ref(false);

  async function fetchUsers() {
    if (hasLoaded.value) return; // No volver a cargar si ya los tenemos

    loading.value = true;
    error.value = null;
    try {
      const response = await routeService.getUsers();
      users.value = response.data;
      hasLoaded.value = true;
    } catch (err) {
      error.value = 'No se pudieron cargar los usuarios.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  return { users, loading, error, fetchUsers };
});