<template>
  <div class="create-document">
    <h2>Crear Nuevo Documento</h2>
    <form @submit.prevent="createDraft">
      <div>
        <label>Tipo de documento:</label>
        <select v-model="form.type" required>
          <option value="report">Informe</option>
          <option value="internal_note">Nota Interna</option>
          <option value="external_note">Nota Externa</option>
        </select>
      </div>
      <div>
        <label>Asunto:</label>
        <input v-model="form.subject" type="text" required />
      </div>
      <div>
        <label>Destinatario:</label>
        <select v-model="form.recipientId" required>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.fullName }} ({{ user.position }})
          </option>
        </select>
      </div>
      <div>
        <label>Vía (Copia opcional):</label>
        <select v-model="form.ccId">
          <option :value="null">Ninguno</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.fullName }}
          </option>
        </select>
      </div>
      <div>
        <label>Referencia (opcional):</label>
        <input v-model="form.reference" type="text" />
      </div>
      <button type="submit" :disabled="loading">Generar Plantilla</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { documentService } from '@/services/document.service';
import { useAuthStore } from '@/stores/auth.store';

const form = ref({
  type: 'report',
  subject: '',
  recipientId: '',
  ccId: null as string | null,
  reference: '',
});
const loading = ref(false);
const users = ref<any[]>([]);
const router = useRouter();
const authStore = useAuthStore();

// Simulamos lista de usuarios (en futuro: endpoint /users)
onMounted(async () => {
  // TODO: cargar usuarios desde backend
  users.value = [
    { id: 'user2', fullName: 'María López', position: 'Jefa de Personal' },
    { id: 'user3', fullName: 'Carlos Díaz', position: 'Analista' },
  ];
});

const createDraft = async () => {
  loading.value = true;
  try {
    const response = await documentService.createDraft(form.value);
    const docId = response.data.id;
    // Descargar plantilla
    const templateRes = await documentService.downloadTemplate(docId);
    const url = window.URL.createObjectURL(new Blob([templateRes.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `plantilla_${response.data.cite}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    router.push('/dashboard');
  } catch (error) {
    alert('Error al crear documento');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>