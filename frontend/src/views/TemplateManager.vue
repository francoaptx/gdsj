<template>
  <div class="template-manager">
    <h2>Gestión de Plantilla de Documentos</h2>
    <p class="subtitle">
      Sube un archivo .docx que servirá como plantilla para todos los documentos
      generados en el sistema.
    </p>

    <div class="upload-section">
      <h3>Subir Nueva Plantilla</h3>
      <p>
        Asegúrate de que tu plantilla contenga los siguientes marcadores de
        texto (placeholders):
      </p>
      <ul class="placeholders-list"> 
        <li><code>{{CITE}}</code> - Código Único de Identificación</li>
        <li><code>{{TIPO_DOCUMENTO}}</code> - Ej: Informe, Nota Interna</li>
        <li><code>{{DESTINATARIO_NOMBRE}}</code> - Nombre completo del destinatario</li>
        <li><code>{{DESTINATARIO_CARGO}}</code> - Cargo del destinatario</li>
        <li><code>{{REMITENTE_NOMBRE}}</code> - Nombre completo del remitente</li>
        <li><code>{{REMITENTE_CARGO}}</code> - Cargo del remitente</li>
        <li><code>{{FECHA}}</code> - Fecha de creación</li>
        <li><code>{{ASUNTO}}</code> - El asunto del documento</li>
        <li><code>{{REFERENCIA}}</code> - La referencia (si existe)</li>
        <li><code>{{CONTENIDO}}</code> - El cuerpo principal del documento</li>
        <li><code>{{CC_NOMBRE}}</code> - Nombre del destinatario en copia (si existe)</li>
      </ul>
      <input type="file" @change="onFileSelected" accept=".docx" />
      <button @click="uploadTemplate" :disabled="!selectedFile || loading">
        {{ loading ? "Subiendo..." : "Guardar Plantilla" }}
      </button>
      <p v-if="message" :class="{ 'success-message': isSuccess, 'error-message': !isSuccess }">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { documentService } from '@/services/document.service'; // Asumimos que el servicio se actualizará

const selectedFile = ref<File | null>(null);
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const uploadTemplate = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  message.value = '';
  try {
    // Necesitarás un nuevo método en tu servicio para manejar la subida
    await documentService.uploadTemplate(selectedFile.value as File);
    message.value = '✅ Plantilla actualizada con éxito.';
    isSuccess.value = true;
  } catch (error) {
    message.value = '❌ Error al subir la plantilla. Inténtalo de nuevo.';
    isSuccess.value = false;
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.template-manager { max-width: 800px; margin: auto; padding: 20px; }
.subtitle { color: #666; }
.upload-section { margin-top: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
.placeholders-list { background: #f5f5f5; padding: 15px; border-radius: 5px; }
.placeholders-list code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
input[type="file"] { margin: 15px 0; }
.success-message { color: green; }
.error-message { color: red; }
</style>