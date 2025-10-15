<!-- src/views/IncomingView.vue -->
<template>
  <div>
    <h2>📥 Bandeja de Entrada</h2>
    <div v-if="loading">Cargando...</div>
    <table v-else>
      <tr v-for="r in incoming" :key="r.id">
        <td>{{ r.routeNumber }}</td>
        <td>{{ r.sender.fullName }}</td>
        <td>{{ new Date(r.createdAt).toLocaleDateString() }}</td>
        <td><button @click="receive(r.id)">Recibir</button></td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { routeService } from '@/services/route.service';

const incoming = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const res = await routeService.getIncomingRoutes();
  incoming.value = res.data;
  loading.value = false;
});

const receive = async (id: string) => {
  await routeService.receiveRoute(id);
  // Actualizar lista
  const res = await routeService.getIncomingRoutes();
  incoming.value = res.data;
};
</script>