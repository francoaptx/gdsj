<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>{{ isEditing ? 'Editar' : 'Crear' }} Usuario</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Nombre Completo *</label>
          <input v-model="form.fullName" type="text" required />
        </div>
        <div class="form-group">
          <label>Nombre de Usuario *</label>
          <input v-model="form.username" type="text" required />
        </div>
        <div class="form-group">
          <label>Contraseña (dejar en blanco para no cambiar)</label>
          <input v-model="form.password" type="password" :required="!isEditing" />
        </div>
        <div class="form-group">
          <label>Cargo *</label>
          <input v-model="form.position" type="text" required />
        </div>
        <div class="form-group">
          <label>Oficina *</label>
          <input v-model="form.office" type="text" required />
        </div>
        <div class="form-group-inline">
          <label>
            <input v-model="form.isAdmin" type="checkbox" />
            Es Administrador
          </label>
          <label>
            <input v-model="form.isActive" type="checkbox" />
            Está Activo
          </label>
        </div>
        <div class="form-actions">
          <button type="button" @click="$emit('close')">Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  fullName: '',
  username: '',
  password: '',
  position: '',
  office: '',
  isAdmin: false,
  isActive: true,
});

const isEditing = ref(false);

watch(() => props.user, (newUser) => {
  if (newUser) {
    isEditing.value = true;
    form.value = { ...newUser, password: '' }; // No cargar la contraseña
  } else {
    isEditing.value = false;
    form.value = { fullName: '', username: '', password: '', position: '', office: '', isAdmin: false, isActive: true };
  }
}, { immediate: true });

const submitForm = () => {
  const dataToSave = { ...form.value };
  if (isEditing.value && !dataToSave.password) {
    delete dataToSave.password; // No enviar contraseña si está vacía en modo edición
  }
  emit('save', dataToSave);
};
</script>

<style scoped>
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
.form-group { margin-bottom: 1rem; }
.form-group-inline { display: flex; gap: 2rem; margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; }
input[type="text"], input[type="password"] { width: 100%; padding: 0.5rem; box-sizing: border-box; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
</style>