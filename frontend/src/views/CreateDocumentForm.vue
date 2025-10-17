<template>
  <div class="create-document-form">
    <h3>Crear Nuevo Documento para Hoja de Ruta</h3>
    <p class="subtitle">
      Complete los datos para generar el CITE. El documento se asociará
      automáticamente.
    </p>
    <form @submit.prevent="createDocument">
      <div>
        <label>Tipo de documento *</label>
        <select v-model="form.type" required>
          <option value="report">Informe</option>
          <option value="internal_note">Nota Interna</option>
          <option value="external_note">Nota Externa</option>
        </select>
      </div>
      <div>
        <label>Asunto *</label>
        <input v-model="form.subject" type="text" required />
      </div>
      <div>
        <label>Destinatario *</label>
        <select v-model="form.recipientId" required>
          <option value="">Seleccionar...</option> 
          <option v-for="user in userStore.users" :key="user.id" :value="user.id">
            {{ user.fullName }} ({{ user.position }})
          </option>
        </select>
      </div>
      <div>
        <label>Vía (Copia opcional):</label>
        <select v-model="form.ccId">
          <option :value="null">Ninguno</option>
          <option v-for="user in userStore.users" :key="user.id" :value="user.id">
            {{ user.fullName }}
          </option>
        </select>
      </div>
      <div>
        <label>Referencia (opcional):</label>
        <input v-model="form.reference" type="text" />
      </div>
      <div>
        <label>Contenido del documento *</label>
        <textarea v-model="form.body" rows="10" required placeholder="Escriba aquí el cuerpo del informe o nota..."></textarea>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Creando..." : "Crear y Asociar Documento" }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { documentService } from "@/services/document.service";
import { useUserStore } from "@/stores/user.store";

// Definir los eventos que este componente puede emitir
const emit = defineEmits(["document-created"]);

const form = ref({
  type: "report",
  subject: "",
  recipientId: "",
  ccId: null as string | null,
  reference: "",
  body: "",
});

const loading = ref(false);
const error = ref<string | null>(null);
const userStore = useUserStore();

onMounted(async () => {
  // Asegurarse de que los usuarios estén cargados
  userStore.fetchUsers();
});

const createDocument = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 1. Llamar al servicio para crear el registro del documento en la BD.
    //    El backend ahora también debe guardar el 'body' del documento.
    const response = await documentService.createDraft(form.value);
    const newDocument = response.data;

    // 2. Pedir al backend que genere y nos devuelva el documento usando la plantilla.
    //    Este método (`downloadGeneratedDocument`) es nuevo y debe ser implementado.
    const fileBlob = await documentService.downloadGeneratedDocument(newDocument.id);

    // 3. Iniciar la descarga en el navegador del usuario.
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${newDocument.cite}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    // 4. Emitir el evento para que la Hoja de Ruta se asocie con el documento.
    // El padre (CreateRouteView) escuchará este evento
    emit("document-created", { ...newDocument, subject: form.value.subject });

  } catch (err) {
    error.value = "Error al crear el documento. Intente de nuevo.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.create-document-form {
  padding: 10px;
}
.subtitle {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 20px;
}
.create-document-form textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.error-message {
  color: red;
  margin-top: 10px;
}
</style>