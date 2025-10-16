<template>
  <div class="sent-routes">
    <AppNotificationModal v-if="notification.show" :title="notification.title" :message="notification.message" :type="notification.type" @close="notification.show = false" />

    <h2>Correspondencia Enviada</h2>
    <div v-if="loading">Cargando...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>N° Hoja de Ruta</th>
            <th>Destinatario</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in routes" :key="route.id">
            <td>{{ route.routeNumber }}</td>
            <td>{{ route.recipient.fullName }}</td>
            <td>{{ new Date(route.createdAt).toLocaleDateString() }}</td>
            <td>
              <span :style="{ color: route.status === 'cancelled' ? 'red' : 'green' }">
                {{ route.status === 'cancelled' ? 'Cancelada' : 'Enviada' }}
              </span>
            </td>
            <td>
              <button @click="downloadPdf(route.id)" title="Descargar PDF">📄</button>
              <button @click="showCopyModal(route)" title="Enviar copia">📎</button>
              <button
                v-if="route.status !== 'cancelled'"
                @click="cancelRoute(route.id)"
                title="Cancelar"
                style="color: red;"
              >
                ❌
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de copia -->
    <CopyRouteModal
      v-if="copyModal"
      :route="copyModal"
      :users="users"
      @close="copyModal = null"
      @copy-sent="handleCopySent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { routeService } from '@/services/route.service';
import CopyRouteModal from '@/components/CopyRouteModal.vue';
import AppNotificationModal from '@/components/AppNotificationModal.vue';

const routes = ref<any[]>([]);
const loading = ref(false);
const copyModal = ref<any>(null);
const users = ref<any[]>([]);
const notification = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
});

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
  notification.message = message;
  notification.type = type;
  notification.title = title || (type === 'success' ? 'Éxito' : (type === 'error' ? 'Error' : 'Información'));
  notification.show = true;
};

onMounted(async () => {
  loading.value = true;
  try {
    // Hacemos la llamada real al backend
    const [routesResponse, usersResponse] = await Promise.all([
      routeService.getSentRoutes(),
      routeService.getUsers(),
    ]);
    routes.value = routesResponse.data;
    users.value = usersResponse.data;
  } catch (error) {
    console.error("Error al cargar la correspondencia enviada:", error);
    showNotification("No se pudo cargar la correspondencia enviada.", 'error');
  } finally {
    loading.value = false;
  }
});

const downloadPdf = async (routeId: string) => {
  const response = await routeService.downloadPdf(routeId);
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `hoja_ruta_${routeId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const cancelRoute = async (routeId: string) => {
  if (confirm('¿Está seguro de que desea cancelar esta hoja de ruta?')) {
    await routeService.cancelRoute(routeId);
    // Actualizar estado local
    const route = routes.value.find(r => r.id === routeId);
    if (route) route.status = 'cancelled';
    showNotification('Hoja de ruta cancelada correctamente.', 'success');
  }
};

const showCopyModal = (route: any) => {
  copyModal.value = route;
};

const handleCopySent = (newCopy: any) => {
  // Opcional: añadir la nueva copia a la lista para no recargar
  // routes.value.unshift(newCopy);
  copyModal.value = null;
};
</script>

<style scoped>
.sent-routes table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
button {
  margin: 0 4px;
  cursor: pointer;
}
</style>