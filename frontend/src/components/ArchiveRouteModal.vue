<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Archivar Hoja de Ruta {{ route.routeNumber }}</h3>
      <div v-if="!loading">
        <div>
          <label for="observation">Observación (opcional):</label>
          <textarea id="observation" v-model="observation" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="archive" :disabled="loading">Archivar</button>
          <button @click="$emit('close')">Cancelar</button>
        </div>
      </div>
      <div v-else>Archivando...</div>

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
import AppNotificationModal from '@/components/AppNotificationModal.vue'; // New import

const props = defineProps({
  route: { type: Object, required: true },
});

const emit = defineEmits(['close', 'archived']);

const notification = reactive({
  show: false,
  message: '',
  title: '',
  type: 'info' as 'success' | 'error' | 'info',
});
const wasSuccess = ref(false);

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
  notification.message = message;
  notification.type = type;
  notification.title = title || (type === 'success' ? 'Éxito' : (type === 'error' ? 'Error' : 'Información'));
  notification.show = true;
};

const observation = ref('');
const loading = ref(false);

const archive = async () => {
  loading.value = true;
  wasSuccess.value = false;
  try {
    // El backend podría requerir un 'folder', aquí usamos 'general' por defecto
    await routeService.archiveRoute(props.route.id, {
      folder: 'general',
      observation: observation.value,
    });
    wasSuccess.value = true;
    showNotification('Hoja de ruta archivada correctamente.', 'success');
  } catch (error: any) {
    console.error('Error al archivar:', error);
    const errorMessage = error.response?.data?.message || 'No se pudo archivar la hoja de ruta.';
    showNotification(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClose = () => {
  notification.show = false;
  if (wasSuccess.value) {
    emit('archived', props.route.id);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; padding: 20px; border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 90%; max-width: 400px;
}
.modal-actions {
  margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;
}
textarea {
  width: 100%;
  padding: 8px;
  margin-top: 6px;
  box-sizing: border-box;
  resize: vertical;
}
</style>