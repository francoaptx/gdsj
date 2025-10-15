<template>
  <div class="modal-backdrop" @mousedown="isMousedownOnBackdrop = true" @mouseup.self="handleBackdropMouseUp">
    <div class="modal-content" @mousedown.stop>
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
          <input v-model="form.position" list="positions-list" type="text" required placeholder="Escriba para buscar..." />
          <datalist id="positions-list">
            <option v-for="pos in positions" :key="pos.id" :value="pos.name" />
          </datalist>
        </div>
        <div class="form-group">
          <label>Oficina *</label>
          <input v-model="form.office" list="offices-list" type="text" required placeholder="Escriba para buscar..." />
          <datalist id="offices-list">
            <option v-for="off in offices" :key="off.id" :value="off.name" />
          </datalist>
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
import { ref, watch, onMounted } from 'vue';
import { catalogService } from '@/services/catalog.service';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

let isMousedownOnBackdrop = false;

const handleBackdropMouseUp = () => {
  // Cierra el modal solo si el mousedown también ocurrió en el backdrop
  if (isMousedownOnBackdrop) {
    emit('close');
  }
  isMousedownOnBackdrop = false; // Resetea para el próximo clic
};

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
const offices = ref<any[]>([]);
const positions = ref<any[]>([]);

onMounted(async () => {
  // Cargar catálogos al montar el modal
  try {
    const [officesRes, positionsRes] = await Promise.all([
      catalogService.getAll('offices'),
      catalogService.getAll('positions'),
    ]);
    offices.value = officesRes.data;
    positions.value = positionsRes.data;
  } catch (error) {
    console.error("Error al cargar los catálogos:", error);
  }
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    isEditing.value = true;
    // Llenar el formulario solo con los campos editables
    form.value = {
      fullName: newUser.fullName || '',
      username: newUser.username || '',
      password: '', // La contraseña siempre empieza vacía en el formulario
      position: newUser.position || '',
      office: newUser.office || '',
      isAdmin: newUser.isAdmin || false,
      isActive: newUser.isActive, // isActive puede ser false
    };
  } else {
    isEditing.value = false;
    // Resetear para el modo de creación
    form.value = { fullName: '', username: '', password: '', position: '', office: '', isAdmin: false, isActive: true };
  }
}, { immediate: true });

const submitForm = () => {
  const dataToSave = { ...form.value };
  if (!dataToSave.password) {
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