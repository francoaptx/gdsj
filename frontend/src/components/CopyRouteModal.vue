<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Enviar copia de {{ route.routeNumber }}</h3>
      <div v-if="!loading">
        <select v-model="copyRecipientId">
          <option disabled value="">Seleccionar destinatario</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.fullName }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="sendCopy" :disabled="!copyRecipientId">Enviar Copia</button>
          <button @click="$emit('close')">Cancelar</button>
        </div>
      </div>
      <div v-else>Enviando copia...</div>

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
  users: { type: Array as () => any[], required: true },
});

const emit = defineEmits(['close', 'copy-sent']);

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

const copyRecipientId = ref('');
const loading = ref(false);

const sendCopy = async () => {
  if (!copyRecipientId.value) return;
  loading.value = true;
  wasSuccess.value = false;
  try {
    const response = await routeService.sendCopy(props.route.id, copyRecipientId.value);
    wasSuccess.value = true;
    showNotification('Copia enviada correctamente.', 'success');
    emit('copy-sent', response.data); // Emitir la nueva copia creada
  } catch (error: any) {
    console.error('Error al enviar la copia:', error);
    const errorMessage = error.response?.data?.message || 'No se pudo enviar la copia.';
    showNotification(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClose = () => {
  notification.show = false;
  if (!wasSuccess.value) emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 400px;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>