<!-- src/components/DocumentChart.vue -->
<template>
  <div class="chart-container">
    <Bar
      :data="chartData"
      :options="chartOptions"
      :height="100"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'vue-chartjs';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  labels: string[];
  data: number[];
}>();

const chartData = {
  labels: props.labels.map(label => {
    const date = new Date(label);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }),
  datasets: [
    {
      label: 'Documentos generados',
      backgroundColor: '#42b983',
      data: props.data,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: {
      callbacks: {
        title: (context: any) => `Fecha: ${context[0].label}`,
        label: (context: any) => `${context.raw} documento(s)`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}
</style>