<template>
  <div class="upload-document">
    <h2>Subir Documento Editado</h2>
    <p>Documento: {{ document?.cite }} - {{ document?.subject }}</p>
    
    <input type="file" @change="onFileChange" accept=".docx" />
    <button @click="upload" :disabled="!selectedFile || loading">
      {{ loading ? 'Subiendo...' : 'Subir Documento' }}
    </button>
    
    <p v-if="uploadSuccess" style="color: green;">✅ Documento subido correctamente.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { documentService } from '@/services/document.service';

const route = useRoute();
const router = useRouter();
const document = ref<any>(null);
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const uploadSuccess = ref(false);

const documentId = route.params.id as string;

onMounted(async () => {
  // En un sistema real, cargarías el documento por ID
  // Por ahora, simulamos
  document.value = { cite: 'DIRECCION_INFORMATICA-2025-0001', subject: 'Informe de prueba' };
});

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const upload = async () => {
  if (!selectedFile.value) return;
  loading.value = true;
  try {
    await documentService.uploadFinalDocument(documentId, selectedFile.value);
    uploadSuccess.value = true;
    setTimeout(() => router.push('/dashboard'), 1500);
  } catch (error) {
    alert('Error al subir el documento');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>