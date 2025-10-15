<template>
  <!-- Modal de Edición -->
  <div v-if="isEditModalOpen" class="modal-backdrop" @click.self="closeModals">
    <div class="modal-content">
      <h2>Editar {{ title.slice(0, -1) }}</h2>
      <input v-model="editingItemName" @keyup.enter="handleUpdateItem" class="modal-input" />
      <div class="modal-actions">
        <button @click="closeModals">Cancelar</button>
        <button @click="handleUpdateItem">Guardar Cambios</button>
      </div>
    </div>
  </div>

  <!-- Modal de Eliminación -->
  <div v-if="isDeleteModalOpen" class="modal-backdrop" @click.self="closeModals">
    <div class="modal-content">
      <h2>Confirmar Eliminación</h2>
      <p>¿Está seguro de que desea eliminar "<strong>{{ itemToDelete?.name }}</strong>"?</p>
      <div class="modal-actions">
        <button @click="closeModals">Cancelar</button>
        <button class="delete-btn" @click="handleConfirmDelete">Eliminar</button>
      </div>
    </div>
  </div>

  <div class="catalog-admin-view">
    <div class="header">
      <h1>Administración de {{ title }}</h1>
    </div>

    <div class="add-item">
      <input v-model="newItemName" :placeholder="`Nuevo nombre de ${title.toLowerCase().slice(0, -1)}`" @keyup.enter="addItem" />
      <button @click="addItem" :disabled="!newItemName">Agregar</button>
    </div>

    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">{{ error }}</div>
    <table v-else>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>
            <button class="action-btn edit" @click="editItem(item)">✏️</button>
            <button class="action-btn delete" @click="deleteItem(item.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { catalogService } from '@/services/catalog.service';

const route = useRoute();
const items = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const newItemName = ref('');

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const itemToEdit = ref<{ id: string; name: string } | null>(null);
const itemToDelete = ref<{ id: string; name: string } | null>(null);
const editingItemName = ref('');

const catalogType = computed(() => route.path.split('/').pop() || '');
const title = computed(() => {
  if (catalogType.value === 'offices') return 'Oficinas';
  if (catalogType.value === 'positions') return 'Cargos';
  return 'Catálogo';
});

const fetchItems = async () => {
  if (!catalogType.value) return;
  loading.value = true;
  try {
    const response = await catalogService.getAll(catalogType.value);
    items.value = response.data;
  } catch (err) {
    error.value = 'No se pudieron cargar los datos.';
  } finally {
    loading.value = false;
  }
};

const addItem = async () => {
  if (!newItemName.value.trim()) return;
  try {
    await catalogService.create(catalogType.value, newItemName.value.trim());
    newItemName.value = '';
    await fetchItems();
  } catch (err) {
    alert('Error al agregar el nuevo ítem. Es posible que ya exista.');
  }
};

const closeModals = () => {
  isEditModalOpen.value = false;
  isDeleteModalOpen.value = false;
  itemToEdit.value = null;
  itemToDelete.value = null;
};

const editItem = (item: { id: string; name: string }) => {
  itemToEdit.value = item;
  editingItemName.value = item.name;
  isEditModalOpen.value = true;
};

const handleUpdateItem = async () => {
  if (!itemToEdit.value || !editingItemName.value.trim()) return;
  try {
    await catalogService.update(catalogType.value, itemToEdit.value.id, editingItemName.value.trim());
    await fetchItems();
    closeModals();
  } catch (err) {
    alert('Error al actualizar el ítem.');
  }
};

const deleteItem = (item: { id: string; name: string }) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    await catalogService.remove(catalogType.value, itemToDelete.value.id);
    await fetchItems();
    closeModals();
  } catch (err) {
    alert('Error al eliminar el ítem. Es posible que esté en uso.');
  }
};

onMounted(fetchItems);

// Observar cambios en la ruta para recargar los datos cuando se navega entre catálogos
watch(catalogType, (newType, oldType) => {
  if (newType && newType !== oldType) {
    fetchItems();
  }
});
</script>

<style scoped>
.catalog-admin-view { padding: 1rem; max-width: 800px; margin: auto; }
.header { margin-bottom: 1rem; }
.add-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.add-item input { flex-grow: 1; padding: 0.5rem; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
.action-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin: 0 0.25rem; }
.edit { color: #007bff; }
.delete { color: #dc3545; }

/* Estilos del Modal */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 400px; }
.modal-input { width: 100%; padding: 0.5rem; margin: 1rem 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.delete-btn { background-color: #dc3545; color: white; }
</style>