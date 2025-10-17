<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Derivar Hoja de Ruta {{ route.routeNumber }}</h3>
      <div v-if="!loading">
        <div>
          <label for="recipient">Destinatario *</label>
          <select id="recipient" v-model="forwardData.recipientId" required>
            <option disabled value="">Seleccionar destinatario</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.fullName }} - {{ user.position }}
            </option>
          </select>
        </div>
        <div>
          <label for="instruction">Nuevo Proveído (Instrucción) *</label>
          <textarea id="instruction" v-model="forwardData.instruction" rows="3" required></textarea>
        </div>
        <div>
          <label for="document">Adjuntar Documento con Cite (opcional)</label>
          <select id="document" v-model="forwardData.documentId">
            <option :value="null">Ninguno</option>
            <option v-for="doc in documents" :key="doc.id" :value="doc.id">
              {{ doc.cite }} - {{ doc.subject }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="forward" :disabled="!isFormValid || loading">Derivar</button>
          <button @click="$emit('close')">Cancelar</button>
        </div>
      </div>
      <div v-else>Derivando...</div>

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
import { ref, reactive, computed } from 'vue';
import { routeService } from '@/services/route.service';
import AppNotificationModal from '@/components/AppNotificationModal.vue';

const props = defineProps({
  route: { type: Object, required: true },
  users: { type: Array as () => any[], required: true },
  documents: { type: Array as () => any[], required: true },
});

const emit = defineEmits(['close', 'forwarded']);

const forwardData = reactive({
  recipientId: '',
  instruction: '',
  documentId: null as string | null,
});

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

const isFormValid = computed(() => forwardData.recipientId && forwardData.instruction);

const forward = async () => {
  if (!isFormValid.value) return;
  loading.value = true;
  wasSuccess.value = false;
  try {
    await routeService.forwardRoute(props.route.id, {
      recipientId: forwardData.recipientId,
      instruction: forwardData.instruction, // This is correct, no change needed here
      documentId: forwardData.documentId || undefined, // Convert null to undefined for optional parameter
    });
    wasSuccess.value = true;
    showNotification('Hoja de ruta derivada correctamente.', 'success');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'No se pudo derivar la hoja de ruta.';
    showNotification(errorMessage, 'error');
  } finally {
    loading.value = false;
  }
};

const handleNotificationClose = () => {
  notification.show = false;
  if (wasSuccess.value) {
    emit('forwarded', props.route.id);
  }
};
</script>

<style scoped>
/* Estilos similares a ArchiveRouteModal.vue */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 90%; max-width: 500px; }
.modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
label { display: block; margin-top: 10px; font-weight: bold; }
input, select, textarea { width: 100%; padding: 8px; margin-top: 6px; box-sizing: border-box; resize: vertical; }
button:disabled { background-color: #ccc; cursor: not-allowed; }
</style>