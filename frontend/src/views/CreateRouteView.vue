<template>
  <div class="create-route">
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
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.fullName }} - {{ user.position }}
          </option>
        </select>
      </div>

      <!-- Documento con Cite (opcional) -->
      <div>
        <label>Documento con Cite (opcional)</label>
        <select v-model="form.documentId">
          <option value="">Ninguno</option>
          <option v-for="doc in documents" :key="doc.id" :value="doc.id">
            {{ doc.cite }} - {{ doc.subject }}
          </option>
        </select>
        <p v-if="form.documentId" style="font-size: 0.9em; color: green;">
          ✅ La referencia se llenará automáticamente con el Cite.
        </p>
      </div>

      <!-- Referencia manual (solo si no hay documento) -->
      <div v-if="!form.documentId">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
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
const users = ref<any[]>([]);
const documents = ref<any[]>([]);
const currentUser = ref<any>(null);
const selectedFile = ref<File | null>(null);
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  currentUser.value = authStore.user;
  const usersResponse = await routeService.getUsers();
  users.value = usersResponse.data; // <-- Extraer los datos de la respuesta
  const documentsResponse = await routeService.getUploadedDocuments();
  documents.value = documentsResponse.data;
});

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

    await routeService.createRoute(routeData, selectedFile.value);
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
}
</style>