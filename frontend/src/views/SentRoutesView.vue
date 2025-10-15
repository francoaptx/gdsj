<template>
  <div class="sent-routes">
    <h2>Correspondencia Enviada</h2>
    <div v-if="loading">Cargando...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>N° Hoja de Ruta</th>
            <th>Destinatario</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in routes" :key="route.id">
            <td>{{ route.routeNumber }}</td>
            <td>{{ route.recipient.fullName }}</td>
            <td>{{ new Date(route.createdAt).toLocaleDateString() }}</td>
            <td>
              <span :style="{ color: route.status === 'cancelled' ? 'red' : 'green' }">
                {{ route.status === 'cancelled' ? 'Cancelada' : 'Enviada' }}
              </span>
            </td>
            <td>
              <button @click="downloadPdf(route.id)" title="Descargar PDF">📄</button>
              <button @click="showCopyModal(route)" title="Enviar copia">📎</button>
              <button
                v-if="route.status !== 'cancelled'"
                @click="cancelRoute(route.id)"
                title="Cancelar"
                style="color: red;"
              >
                ❌
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de copia -->
    <div v-if="copyModal" class="modal">
      <h3>Enviar copia de {{ copyModal.routeNumber }}</h3>
      <select v-model="copyRecipientId">
        <option value="">Seleccionar destinatario</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.fullName }}
        </option>
      </select>
      <button @click="sendCopy">Enviar Copia</button>
      <button @click="copyModal = null">Cancelar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { routeService } from '@/services/route.service';

const routes = ref<any[]>([]);
const loading = ref(false);
const copyModal = ref<any>(null);
const copyRecipientId = ref('');
const users = ref<any[]>([
  { id: 'user2', fullName: 'María López' },
  { id: 'user3', fullName: 'Carlos Díaz' },
]);

onMounted(async () => {
  loading.value = true;
  try {
    // Simulamos datos (en futuro: routeService.getSentRoutes())
    routes.value = [
      {
        id: 'r1',
        routeNumber: 'HR-20251015-0001',
        recipient: { fullName: 'María López' },
        createdAt: new Date(),
        status: 'sent',
      },
      {
        id: 'r2',
        routeNumber: 'HR-20251015-0002',
        recipient: { fullName: 'Carlos Díaz' },
        createdAt: new Date(Date.now() - 86400000),
        status: 'cancelled',
      },
    ];
  } finally {
    loading.value = false;
  }
});

const downloadPdf = async (routeId: string) => {
  const response = await routeService.downloadPdf(routeId);
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `hoja_ruta_${routeId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const cancelRoute = async (routeId: string) => {
  if (confirm('¿Cancelar esta hoja de ruta?')) {
    await routeService.cancelRoute(routeId);
    // Actualizar estado local
    const route = routes.value.find(r => r.id === routeId);
    if (route) route.status = 'cancelled';
  }
};

const showCopyModal = (route: any) => {
  copyModal.value = route;
  copyRecipientId.value = '';
};

const sendCopy = async () => {
  if (!copyRecipientId.value) return;
  await routeService.sendCopy(copyModal.value.id, copyRecipientId.value);
  alert('Copia enviada');
  copyModal.value = null;
};
</script>

<style scoped>
.sent-routes table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
button {
  margin: 0 4px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
}
</style>