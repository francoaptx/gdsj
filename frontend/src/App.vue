<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  // Redirigir al login después de cerrar sesión
  router.push('/login')
}
</script>

<template>
  <div id="app-layout">
    <header class="app-header" v-if="authStore.isAuthenticated">
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/crear-ruta">Nueva Ruta</RouterLink>
        <RouterLink to="/recibidos">Recibidos</RouterLink>
        <RouterLink to="/pendientes">Pendientes</RouterLink>
        <RouterLink to="/enviados">Enviados</RouterLink>
        <RouterLink v-if="authStore.user?.isAdmin" to="/admin/users">Usuarios</RouterLink>
        <RouterLink v-if="authStore.user?.isAdmin" to="/admin/offices">Oficinas</RouterLink>
        <RouterLink v-if="authStore.user?.isAdmin" to="/admin/positions">Cargos</RouterLink>
        <!-- Agrega más enlaces aquí -->
      </nav>
      <div class="user-info">
        <span>{{ authStore.user?.fullName }}</span>
        <button @click="logout">Salir</button>
      </div>
    </header>

    <main class="app-content">
      <!-- Aquí es donde Vue Router renderizará tus vistas (HomeView, etc.) -->
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Puedes agregar estilos básicos para tu layout aquí */
.app-header { display: flex; justify-content: space-between; padding: 1rem; background: #f0f0f0; }
nav a { margin-right: 1rem; }
.app-content { padding: 1rem; }
</style>
