<template>
  <UserFormModal v-if="isModalOpen" :user="selectedUser" @close="closeModal" @save="handleSave" />
  <div class="user-admin-view">
    <div class="header">
      <h1>Administración de Usuarios</h1>
      <button @click="openCreateModal">Crear Nuevo Usuario</button>
    </div>

    <div v-if="loading">Cargando usuarios...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Usuario</th>
          <th>Cargo</th>
          <th>Oficina</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.fullName }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.position }}</td>
          <td>{{ user.office }}</td>
          <td>{{ user.isAdmin ? 'Admin' : 'Usuario' }}</td>
          <td>
            <span :class="user.isActive ? 'status-active' : 'status-inactive'">
              {{ user.isActive ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <button class="action-btn edit" @click="openEditModal(user)">✏️</button>
            <button class="action-btn delete" @click="deleteUser(user.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UserFormModal from '@/components/UserFormModal.vue';
import { userService } from '@/services/user.service';

const users = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const isModalOpen = ref(false);
const selectedUser = ref<any | null>(null);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await userService.getAll();
    users.value = response.data;
  } catch (err) {
    error.value = 'No se pudieron cargar los usuarios. Es posible que no tengas permisos.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const openCreateModal = () => {
  selectedUser.value = null;
  isModalOpen.value = true;
};

const openEditModal = (user: any) => {
  selectedUser.value = user;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};

const handleSave = async (userData: any) => {
  try {
    let response;
    if (selectedUser.value) {
      // Editar
      response = await userService.update(selectedUser.value.id, userData);
    } else {
      // Crear
      response = await userService.create(userData);
    }
    if (response.data) {
      closeModal();
      await fetchUsers(); // Recargar la lista solo si fue exitoso
    }
  } catch (err: any) {
    console.error('Error al guardar el usuario:', err);
    // Extraer mensajes de error del backend
    const errorMessages = err.response?.data?.message;
    const message = Array.isArray(errorMessages) ? errorMessages.join(', ') : 'No se pudo guardar el usuario. Verifique los datos (ej: el nombre de usuario no debe repetirse).';
    alert(message);
  }
};

const deleteUser = async (userId: string) => {
  if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
    try {
      await userService.remove(userId);
      await fetchUsers(); // Recargar la lista
    } catch (err) {
      console.error('Error al eliminar el usuario:', err);
      alert('No se pudo eliminar el usuario.');
    }
  }
};
</script>

<style scoped>
.user-admin-view { padding: 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.status-active { color: green; font-weight: bold; }
.status-inactive { color: red; font-weight: bold; }
.action-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin: 0 0.25rem; }
.edit { color: #007bff; }
.delete { color: #dc3545; }
</style>