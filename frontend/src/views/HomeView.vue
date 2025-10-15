<!-- src/views/HomeView.vue -->
<template>
  <div>
    <h1>Bienvenido al Sistema COINSSJJ</h1>
    <p>Usuario: {{ authStore.user?.username }}</p>
    <button @click="logout">Cerrar Sesión</button>
  </div>
    <div class="chart-section">
      <h3>📊 Documentos Generados (Últimos 30 días)</h3>
      <DocumentChart
        v-if="!dashboardStore.loading && dashboardStore.chartData.labels.length"
        :labels="dashboardStore.chartData.labels"
        :data="dashboardStore.chartData.data"
      />
      <div v-else-if="!dashboardStore.loading">
        No hay documentos en los últimos 30 días.
      </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import DocumentChart from '@/components/DocumentChart.vue';
import { useDashboardStore } from '@/stores/dashboard.store';

const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.fetchDashboard(); // ← llamada a la acción
});

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>