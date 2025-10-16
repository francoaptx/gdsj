<!-- src/views/PendingView.vue -->
<template>
  <div class="pending-view">
    <h2>⏳ Pendientes</h2>

    <!-- Barra de búsqueda y acciones -->
    <div class="actions-bar">
      <input v-model="searchQuery" placeholder="Buscar por N°, referencia o remitente..." @input="handleSearch" />
      <button v-if="selectedRoutes.length >= 2" @click="openGroupModal">
        Agrupar Seleccionadas ({{ selectedRoutes.length }})
      </button>
    </div>

    <!-- Contenido principal -->
    <div v-if="loading">Cargando...</div>
    <div v-else-if="filteredRoutes.length === 0 && allRoutes.length > 0">No hay resultados para su búsqueda.</div>
    <div v-else-if="allRoutes.length === 0">No tienes correspondencia pendiente.</div>
    <table v-else>
      <thead>
        <tr>
          <th></th>
          <th>N° Hoja de Ruta</th>
          <th>Remitente</th>
          <th>Proveído</th>
          <th>Plazo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in filteredRoutes" :key="route.id">
          <td>
            <input v-if="!route.groupId" type="checkbox" :value="route.id" v-model="selectedRoutes" />
            <span v-else title="Agrupado">📦</span>
          </td>
          <td>{{ route.routeNumber }}</td>
          <td>{{ route.sender.fullName }}</td>
          <td>{{ route.instruction }}</td>
          <td :style="{ color: getDeadlineColor(route.deadline) }">
            {{ new Date(route.deadline).toLocaleDateString() }} ({{ getDaysRemaining(route.deadline) }} días)
          </td>
          <td>
            <button @click="showArchiveModal(route)" title="Archivar">🗄️</button>
            <button @click="showForwardModal(route)" title="Derivar">➡️</button>
            <button v-if="route.groupId && route.isMainRoute" @click="ungroup(route.groupId)" title="Desagrupar">
              ↩️
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modales -->
    <ArchiveRouteModal v-if="activeModal === 'archive'" :route="selectedRoute" @close="closeModal" @archived="handleActionCompleted" />
    <ForwardRouteModal v-if="activeModal === 'forward'" :route="selectedRoute" :users="users" :documents="[]" @close="closeModal" @forwarded="handleActionCompleted" />
    <GroupRouteModal v-if="activeModal === 'group'" :routes="allRoutes" :selectedRouteIds="selectedRoutes" @close="closeModal" @group-confirmed="handleGroupCompleted" />
    <AppNotificationModal v-if="notification.show" :title="notification.title" :message="notification.message" :type="notification.type" @close="notification.show = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { routeService } from '@/services/route.service';
import ArchiveRouteModal from '@/components/ArchiveRouteModal.vue'; // Corrected path
import ForwardRouteModal from '@/components/ForwardRouteModal.vue'; // Corrected path
import GroupRouteModal from '@/components/GroupRouteModal.vue'; // Corrected path
import AppNotificationModal from '@/components/AppNotificationModal.vue';

const allRoutes = ref<any[]>([]);

const selectedRoute = ref<any | null>(null);
const activeModal = ref<'archive' | 'forward' | 'group' | null>(null);

const selectedRoutes = ref<string[]>([]);
const searchQuery = ref('');

const notification = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
});

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
  notification.message = message;
  notification.type = type;
  notification.title = title || (type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información');
  notification.show = true;
};

const users = ref<any[]>([]); // Los usuarios para los modales se siguen cargando localmente
const loading = ref(true);

const fetchPendingData = async () => {
  loading.value = true;
  try {
    const [routesRes, usersRes] = await Promise.all([
      routeService.getPendingRoutes(),
      routeService.getUsers(),
    ]);
    allRoutes.value = routesRes.data;
    users.value = usersRes.data;
  } catch (error) {
    console.error("Error al cargar datos de pendientes:", error);
    showNotification("No se pudieron cargar los datos de pendientes.", 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPendingData);

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return allRoutes.value;
  const query = searchQuery.value.toLowerCase();
  return allRoutes.value.filter(r =>
    r.routeNumber.toLowerCase().includes(query) ||
    (r.reference || '').toLowerCase().includes(query) ||
    r.sender.fullName.toLowerCase().includes(query)
  );
});

const handleSearch = () => { /* La propiedad computada se actualiza sola */ };

const getDaysRemaining = (deadline: string) => {
  const now = new Date();
  const end = new Date(deadline);
  const diffTime = end.getTime() - now.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDeadlineColor = (deadline: string) => {
  const days = getDaysRemaining(deadline);
  if (days <= 1) return 'red';
  if (days <= 2) return 'orange';
  return 'inherit';
};

const showArchiveModal = (route: any) => {
  selectedRoute.value = route;
  activeModal.value = 'archive';
};

const showForwardModal = (route: any) => {
  selectedRoute.value = route;
  activeModal.value = 'forward';
};

const openGroupModal = () => {
  activeModal.value = 'group';
};

const closeModal = () => {
  selectedRoute.value = null;
  activeModal.value = null;
};

const handleActionCompleted = (routeId: string) => {
  allRoutes.value = allRoutes.value.filter(r => r.id !== routeId);
  closeModal();
};

const handleGroupCompleted = async () => {
  await fetchPendingData(); // Forzar la recarga de datos desde el servidor
  selectedRoutes.value = []; // Limpiar selección
  closeModal();
};

const ungroup = async (groupId: string) => {
  if (!confirm('¿Está seguro de que desea desagrupar estas hojas de ruta?')) return;
  try {
    await routeService.ungroupRoutes(groupId);
    showNotification('Hojas de ruta desagrupadas correctamente.', 'success');
    await fetchPendingData(); // Recargar datos
  } catch (error) {
    showNotification('Error al desagrupar.', 'error');
  }
};
</script>

<style scoped>
.pending-view { padding: 1rem; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.actions-bar input { padding: 8px; width: 300px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
th { background-color: #f4f4f4; }
button { margin: 0 4px; cursor: pointer; background: none; border: none; font-size: 1.2em; }
</style>