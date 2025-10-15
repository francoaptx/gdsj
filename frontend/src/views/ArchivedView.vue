<!-- src/views/ArchivedView.vue -->
<template>
  <div>
    <h2>📁 Archivados</h2>
    <table>
      <tr v-for="r in archived" :key="r.id">
        <td>{{ r.routeNumber }}</td>
        <td>{{ r.sender.fullName }}</td>
        <td>{{ r.archiveFolder }}</td>
        <td>{{ r.archiveObservation }}</td>
        <td>
          <button @click="unarchive(r.id)">Desarchivar</button>
          <button @click="showHistory(r.id)">Seguimiento</button>
        </td>
      </tr>
    </table>

    <!-- Modal de historial -->
    <div v-if="historyModal" class="modal">
      <h3>Seguimiento de {{ historyModal.routeNumber }}</h3>
      <div v-for="h in history" :key="h.id" class="history-item">
        <strong>{{ new Date(h.timestamp).toLocaleString() }}</strong><br/>
        {{ h.user.fullName }} → {{ h.action }}<br/>
        <em>{{ h.details }}</em>
      </div>
      <button @click="historyModal = null">Cerrar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { routeService } from '@/services/route.service';

const archived = ref<any[]>([]);
const historyModal = ref<any>(null);
const history = ref<any[]>([]);

// Cargar archivados (simulado)
archived.value = [
  {
    id: 'r1',
    routeNumber: 'HR-20251015-0001',
    sender: { fullName: 'Admin' },
    archiveFolder: '2025/Informes',
    archiveObservation: 'Trámite concluido',
  }
];

const unarchive = async (id: string) => {
  await routeService.unarchiveRoute(id);
  alert('Desarchivado');
};

const showHistory = async (routeId: string) => {
  const res = await routeService.getRouteHistory(routeId);
  history.value = res.data;
  historyModal.value = archived.value.find(r => r.id === routeId);
};
</script>

<style scoped>
.history-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.modal {
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>