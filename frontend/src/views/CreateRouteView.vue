<template>
  <div class="create-route">
    <!-- Modal para Crear Documento -->
    <div v-if="showDocumentModal" class="modal-overlay" @mousedown.self="closeDocumentModal">
      <div class="modal-content" @mousedown.stop>
        <button @click="closeDocumentModal" class="modal-close-button">&times;</button>
        <!-- Componente para crear documento -->
        <CreateDocumentForm @document-created="handleDocumentCreated" />
      </div>
    </div>

    <h2>Crear Hoja de Ruta</h2>

    <form @submit.prevent="submitRoute">
      <!-- Datos automáticos -->
      <div class="auto-fields">
        <p><strong>Remitente:</strong> {{ currentUser?.fullName }} ({{ currentUser?.position }})</p>
        <p><strong>Oficina:</strong> {{ currentUser?.office }}</p>
      </div>

      <!-- Destinatario -->
      <div>
        <label>Destinatario *</label>
        <select v-model="form.recipientId" required>
          <option value="">Seleccionar...</option>
          <option v-for="user in userStore.users" :key="user.id" :value="user.id">
            {{ user.fullName }} - {{ user.position }}
          </option>
        </select>
      </div>

      <!-- Tipo de Referencia -->
      <div>
        <label>Referencia *</label>
        <select v-model="referenceType" @change="onReferenceTypeChange">
          <option value="manual">Sin Documento (Referencia manual)</option>
          <option value="document">Con Documento (Cite automático)</option>
        </select>
      </div>

      <!-- Selector de Documento (si se elige 'document') -->
      <div v-if="referenceType === 'document'">
        <label>Documento con Cite</label>
        <div class="document-control">
          <input 
            type="text" 
            :value="selectedDocumentInfo" 
            placeholder="Ningún documento seleccionado" 
            readonly 
            class="document-display-input"
          />
          <button type="button" @click="openDocumentModal" class="secondary-button">Crear Documento</button>
        </div>
      </div>



      <!-- Campo de Referencia manual (si se elige 'manual') -->
      <div v-if="referenceType === 'manual'">
        <label>Referencia (opcional)</label>
        <input v-model="form.reference" type="text" />
      </div>

      <!-- Proveído -->
      <div>
        <label>Proveído (Instrucción) *</label>
        <textarea v-model="form.instruction" required></textarea>
      </div>

      <!-- Hojas y anexos -->
      <div>
        <label>N° de hojas</label>
        <input v-model.number="form.totalPages" type="number" min="1" />
      </div>
      <div>
        <label>N° de anexos</label>
        <input v-model.number="form.attachmentsCount" type="number" min="0" />
      </div>

      <!-- Archivo adjunto simple -->
      <div>
        <label>Adjuntar archivo (opcional, max 5MB)</label>
        <input type="file" @change="onFileChange" accept=".pdf,.jpg,.png,.docx" />
      </div>

      <!-- Prioridad -->
      <div>
        <label>Prioridad</label>
        <label><input v-model="form.priority" type="radio" value="normal" /> Normal</label>
        <label><input v-model="form.priority" type="radio" value="urgent" /> Urgente</label>
      </div>

      <button type="submit" :disabled="loading">Enviar Hoja de Ruta</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useUserStore } from '@/stores/user.store'; // Corrected import path
import CreateDocumentForm from './CreateDocumentForm.vue';
import { routeService } from '@/services/route.service';

const form = ref({
  recipientId: '',
  documentId: null as string | null,
  reference: '',
  instruction: '',
  totalPages: 1,
  attachmentsCount: 0,
  priority: 'normal',
});
const loading = ref(false);
const currentUser = ref<any>(null);
const referenceType = ref('manual'); // 'manual' o 'document'
const selectedFile = ref<File | null>(null);
const showDocumentModal = ref(false);
const selectedDocumentInfo = ref('');
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

onMounted(async () => {
  currentUser.value = authStore.user;
  // Cargar usuarios desde el store
  userStore.fetchUsers();
  // Ya no necesitamos cargar los documentos al inicio
});

const onReferenceTypeChange = () => {
  if (referenceType.value === 'manual') {
    form.value.documentId = null;
    selectedDocumentInfo.value = '';
  } else {
    form.value.reference = '';
  }
};

const openDocumentModal = () => {
  showDocumentModal.value = true;
};

const closeDocumentModal = () => {
  showDocumentModal.value = false;
};

// Este manejador se activa cuando el componente hijo emite el evento 'document-created'
const handleDocumentCreated = (newDocument: any) => {
  if (newDocument && newDocument.id) {
    form.value.documentId = newDocument.id;
    selectedDocumentInfo.value = `${newDocument.cite} - ${newDocument.subject}`;
    closeDocumentModal();
  } else {
    console.error('El evento document-created no contenía un documento válido:', newDocument);
  }
};


const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  } else {
    selectedFile.value = null; // Limpiar la selección si no hay archivo
  }
};

const submitRoute = async () => {
  loading.value = true;
  try {
    // Construir el objeto de datos explícitamente para mayor seguridad y claridad
    const routeData: { [key: string]: any } = {
      recipientId: form.value.recipientId,
      instruction: form.value.instruction,
      totalPages: form.value.totalPages,
      attachmentsCount: form.value.attachmentsCount,
      priority: form.value.priority,
    };

    // Añadir campos opcionales solo si tienen valor
    if (form.value.documentId) {
      routeData.documentId = form.value.documentId;
    } else if (form.value.reference) {
      routeData.reference = form.value.reference;
    }

 await routeService.createRoute(routeData, selectedFile.value || undefined);
    alert('✅ Hoja de ruta enviada correctamente');
    router.push('/enviados'); // RF 4.7
  } catch (error) {
    alert('Error al enviar hoja de ruta');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-route {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.auto-fields {
  background: #f0f0f0;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}
input, select, textarea {
  width: 100%;
  padding: 8px;
  margin: 6px 0;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.secondary-button {
  background: #6c757d;
  padding: 8px 12px;
  font-size: 14px;
  width: auto;
  margin-left: 10px;
}
.document-control {
  display: flex;
  align-items: center;
}
.document-display-input {
  flex-grow: 1;
  background-color: #e9ecef;
  cursor: default;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  position: relative;
}
.modal-close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
}
</style>