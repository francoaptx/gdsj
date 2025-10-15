import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/crear-ruta',
      name: 'create-route',
      // Esto carga el componente solo cuando se visita la ruta
      component: () => import('../views/CreateRouteView.vue'),
    },
    {
      path: '/enviados',
      name: 'sent-routes',
      component: () => import('../views/SentRoutesView.vue'), // Asegúrate de que este componente exista
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/UserAdminView.vue'),
    },
    // Agrega aquí otras rutas de tu aplicación
    // Por ejemplo: /recibidos, /archivados, etc.
  ],
})

router.beforeEach(async (to) => {
  // Redirigir al login si no está autenticado e intenta acceder a una ruta protegida
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const auth = useAuthStore();

  // Si el usuario no está cargado pero hay un token, espera a que se cargue el perfil
  if (auth.token && !auth.user) {
    await auth.fetchProfile();
  }

  if (authRequired && !auth.isAuthenticated) {
    auth.returnUrl = to.fullPath;
    return '/login';
  } else if (!authRequired && auth.isAuthenticated) {
    // Si el usuario está autenticado, no debe poder ver la página de login
    return '/';
  }
});

export default router