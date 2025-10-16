<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Agrupar Hojas de Ruta</h3>
      <p>Seleccione la hoja de ruta principal para el grupo:</p>
      <div v-if="!loading">
        <div class="route-selection">
          <div v-for="routeId in selectedRouteIds" :key="routeId" class="route-item">
            <label>
              <input type="radio" :value="routeId" v-model="mainRouteId" />
              {{ getRouteNumber(routeId) }} - {{ getRouteReference(routeId) }}
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="confirmGroup" :disabled="!mainRouteId || loading">Agrupar</button>
          <button @click="$emit('close')">Cancelar</button>
        </div>
      </div>
      <div v-else>Agrupando hojas de ruta...</div>

      <AppNotificationModal
        v-if="notification.show"
        :title="notification.title"
        :message="notification.message"
        :type="notification.type"
        @close="handleNotificationClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { routeService } from '@/services/route.service';
import AppNotificationModal from '@/components/AppNotificationModal.vue';

const props = defineProps({
  routes: { type: Array as () => any[], required: true }, // Todas las rutas pendientes
  selectedRouteIds: { type: Array as () => string[], required: true }, // IDs de rutas seleccionadas
});

const emit = defineEmits(['close', 'group-confirmed']);

const mainRouteId = ref('');
const loading = ref(false);
const wasSuccess = ref(false);

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

const getRouteNumber = (id: string) => props.routes.find(r => r.id === id)?.routeNumber || 'N/A';
const getRouteReference = (id: string) => props.routes.find(r => r.id === id)?.reference || 'Sin referencia';

const confirmGroup = async () => {
  if (!mainRouteId.value) {
    showNotification('Debe seleccionar una hoja de ruta principal.', 'error');
    return;
  }
  loading.value = true;
  wasSuccess.value = false;
  try {
    await routeService.groupRoutes({
      routeIds: props.selectedRouteIds,
      mainRouteId: mainRouteId.value,
    });
    wasSuccess.value = true;
    showNotification('Hojas de ruta agrupadas correctamente.', 'success');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'No se pudieron agrupar las hojas de ruta.';
    showNotification(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClose = () => {
  notification.show = false;
  if (wasSuccess.value) {
    emit('group-confirmed'); // Notificar a la vista padre que la agrupación se completó
  }
};
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 90%; max-width: 500px; }
.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
.route-selection { max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
.route-item { margin-bottom: 8px; }
label { display: flex; align-items: center; cursor: pointer; }
input[type="radio"] { margin-right: 8px; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
</style>