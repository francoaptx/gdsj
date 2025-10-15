// src/stores/dashboard.store.ts
import { defineStore } from 'pinia';
import { dashboardService } from '@/services/dashboard.service';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    counters: { inbox: 0, pending: 0, sent: 0, archived: 0 },
    notifications: [] as any[],
    chartData: {
        labels: [] as string[],
        data: [] as number[],
    },
  }),

  actions: {
    // 👇 AQUÍ está fetchDashboard
    async fetchDashboard() {
      this.loading = true;
      try {
        const response = await dashboardService.getDashboardData();
            this.counters = response.data.counters;
            this.chartData = response.data.chartData; // <-- nuevo
            this.notifications = response.data.notifications;
      } catch (error) {
        console.error('Error al cargar el dashboard', error);
      } finally {
        this.loading = false;
      }
    }
  }
});