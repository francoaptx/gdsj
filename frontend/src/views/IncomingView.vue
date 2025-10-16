<!-- src/views/IncomingView.vue -->
<template>
  <div class="incoming-view">
    <h2>📥 Bandeja de Entrada</h2>
    <div v-if="loading">Cargando...</div>
    <div v-else-if="incoming.length === 0">No tienes correspondencia nueva en tu bandeja de entrada.</div>
    <table v-else>
      <thead>
        <tr>
          <th>N° Hoja de Ruta</th>
          <th>Remitente</th>
          <th>Referencia</th>
          <th>Fecha de Envío</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in incoming" :key="route.id">
          <td>{{ route.routeNumber }}</td>
          <td>{{ route.sender.fullName }}</td>
          <td>{{ route.reference || 'N/A' }}</td>
          <td>{{ new Date(route.createdAt).toLocaleDateString() }}</td>
          <td>
            <button @click="receive(route.id)" title="Acusar Recibo">👍</button>
          </td>
        </tr>
      </tbody>
    </table>
    <AppNotificationModal
      v-if="notification.show"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      @close="notification.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { routeService } from '@/services/route.service';
import AppNotificationModal from '@/components/AppNotificationModal.vue';

const incoming = ref<any[]>([]);
const loading = ref(false);

const notification = reactive({
  show: false,
  message: '',
  title: '',
  type: 'info' as 'success' | 'error' | 'info',
});

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
  notification.message = message;
  notification.type = type;
  notification.title = title || (type === 'success' ? 'Éxito' : (type === 'error' ? 'Error' : 'Información'));
  notification.show = true;
};

const fetchIncomingRoutes = async () => {
  loading.value = true;
  try {
    const res = await routeService.getIncomingRoutes();
    incoming.value = res.data;
  } catch (error) {
    console.error("Error al cargar la bandeja de entrada:", error);
    showNotification("No se pudo cargar la bandeja de entrada.", 'error', 'Error de Carga');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIncomingRoutes);

const receive = async (id: string) => {
  try {
    await routeService.receiveRoute(id);
    // Para una UI reactiva, eliminamos el elemento de la lista local
    incoming.value = incoming.value.filter(route => route.id !== id);
    showNotification('Recepción confirmada. La hoja de ruta se movió a su bandeja de Pendientes.', 'success', '¡Recibido!');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'No se pudo confirmar la recepción.';
    console.error('Error al recibir la hoja de ruta:', error);
    showNotification(errorMessage, 'error', 'Error al Recibir');
  }
};
</script>

<style scoped>
.incoming-view { padding: 1rem; }
table {
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
  background: none;
  border: none;
  font-size: 1.2em;
}
</style>