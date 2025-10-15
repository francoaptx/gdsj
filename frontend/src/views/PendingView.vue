<!-- src/views/PendingView.vue -->
<template>
  <div>
    <h2>⏳ Pendientes</h2>
    <div v-for="r in pending" :key="r.id" class="route-card">
      <p><strong>{{ r.routeNumber }}</strong> de {{ r.sender.fullName }}</p>
      <p>Proveído: {{ r.instruction }}</p>
      
      <!-- Plazo con color (RNF 2.6) -->
      <p :style="{ color: getDeadlineColor(r.deadline) }">
        Plazo máximo: {{ new Date(r.deadline).toLocaleDateString() }}
        ({{ getDaysRemaining(r.deadline) }} días)
      </p>

      <button @click="showArchiveModal(r)">Archivar</button>
      <button @click="showForwardModal(r)">Derivar</button>
    </div>

    <!-- Modal Archivar -->
    <div v-if="archiveModal" class="modal">
      <h3>Archivar {{ archiveModal.routeNumber }}</h3>
      <input v-model="archiveData.folder" placeholder="Nombre de carpeta" required />
      <textarea v-model="archiveData.observation" placeholder="Observación" required></textarea>
      <button @click="archive">Archivar</button>
      <button @click="archiveModal = null">Cancelar</button>
    </div>

    <!-- Modal Derivar -->
    <div v-if="forwardModal" class="modal">
      <h3>Derivar {{ forwardModal.routeNumber }}</h3>
      <select v-model="forwardData.recipientId">
        <option value="">Seleccionar destinatario</option>
        <option v-for="u in users" :key="u.id" :value="u.id">{{ u.fullName }}</option>
      </select>
      <select v-model="forwardData.documentId">
        <option value="">Sin documento adjunto</option>
        <option v-for="d in documents" :key="d.id" :value="d.id">{{ d.cite }}</option>
      </select>
      <button @click="forward">Derivar</button>
      <button @click="forwardModal = null">Cancelar</button>
    </div>
  </div>

    <!-- En PendingView.vue -->
    <template>
    <div>
        <SearchBar v-model:query="searchQuery" @on-search="handleSearch" />
        
        <div v-if="selectedRoutes.length >= 2">
        <button @click="showGroupModal = true">Agrupar Seleccionadas</button>
        </div>

        <div v-for="r in filteredRoutes" :key="r.id" class="route-card">
        <input
            v-if="!r.groupId"
            type="checkbox"
            v-model="selectedRoutes"
            :value="r.id"
        />
        <span v-else> 📦 Grupo: {{ r.groupId.substring(0, 8) }} </span>
        
        <!-- ... resto del contenido ... -->
        
        <button v-if="r.groupId && r.isMainRoute" @click="ungroup(r.groupId)">
            Desagrupar
        </button>
        </div>

        <!-- Modal de agrupación -->
        <div v-if="showGroupModal" class="modal">
        <h3>Seleccionar hoja principal</h3>
        <div v-for="id in selectedRoutes" :key="id">
            <label>
            <input
                type="radio"
                v-model="mainRouteId"
                :value="id"
            />
            {{ getRouteById(id)?.routeNumber }}
            </label>
        </div>
        <button @click="groupSelected">Agrupar</button>
        <button @click="showGroupModal = false">Cancelar</button>
        </div>
    </div>
    </template>

    <script setup lang="ts">
    // ... imports y setup ...
    const selectedRoutes = ref<string[]>([]);
    const showGroupModal = ref(false);
    const mainRouteId = ref('');
    const searchQuery = ref('');

    const filteredRoutes = computed(() => {
    if (!searchQuery.value) return pending.value;
    return pending.value.filter(r =>
        r.routeNumber.includes(searchQuery.value) ||
        r.reference?.includes(searchQuery.value) ||
        r.sender.fullName.includes(searchQuery.value) ||
        r.instruction?.includes(searchQuery.value)
    );
    });

    const groupSelected = async () => {
    await routeService.groupRoutes({
        routeIds: selectedRoutes.value,
        mainRouteId: mainRouteId.value,
    });
    // Recargar
    const res = await routeService.getPendingRoutes();
    pending.value = res.data;
    selectedRoutes.value = [];
    showGroupModal.value = false;
    };

    const ungroup = async (groupId: string) => {
    await routeService.ungroupRoutes(groupId);
    const res = await routeService.getPendingRoutes();
    pending.value = res.data;
    };

    const handleSearch = (query: string) => {
    searchQuery.value = query;
    };

    const printCover = async (groupId: string) => {
    const res = await routeService.downloadGroupCover(groupId);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    window.open(url, '_blank');
    };
    </script>

    
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { routeService } from '@/services/route.service';

const pending = ref<any[]>([]);
const loading = ref(false);
const archiveModal = ref<any>(null);
const archiveData = ref({ folder: '', observation: '' });
const forwardModal = ref<any>(null);
const forwardData = ref({ recipientId: '', documentId: '' });
const users = ref([{ id: 'u2', fullName: 'María López' }]);
const documents = ref([{ id: 'd1', cite: 'DI-2025-0001' }]);

onMounted(async () => {
  const res = await routeService.getPendingRoutes();
  pending.value = res.data;
});

const getDaysRemaining = (deadline: string) => {
  const now = new Date();
  const end = new Date(deadline);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDeadlineColor = (deadline: string) => {
  const days = getDaysRemaining(deadline);
  if (days <= 0) return 'red';
  if (days <= 2) return 'orange';
  return 'green'; // RNF 2.6
};

const showArchiveModal = (route: any) => {
  archiveModal.value = route;
  archiveData.value = { folder: '', observation: '' };
};

const archive = async () => {
  await routeService.archiveRoute(archiveModal.value.id, archiveData.value);
  // Recargar
  const res = await routeService.getPendingRoutes();
  pending.value = res.data;
  archiveModal.value = null;
};

const showForwardModal = (route: any) => {
  forwardModal.value = route;
  forwardData.value = { recipientId: '', documentId: '' };
};

const forward = async () => {
  await routeService.forwardRoute(forwardModal.value.id, forwardData.value);
  const res = await routeService.getPendingRoutes();
  pending.value = res.data;
  forwardModal.value = null;
};
</script>

<style scoped>
.route-card {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}
.modal {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>