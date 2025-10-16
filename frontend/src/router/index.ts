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
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/crear-ruta',
      name: 'create-route',
      // Esto carga el componente solo cuando se visita la ruta
      component: () => import('../views/CreateRouteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/enviados',
      name: 'sent-routes',
      component: () => import('../views/SentRoutesView.vue'), // Asegúrate de que este componente exista
      meta: { requiresAuth: true },
    },
    {
      path: '/recibidos',
      name: 'incoming-routes',
      component: () => import('../views/IncomingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pendientes',
      name: 'pending-routes',
      component: () => import('../views/PendingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/UserAdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/offices',
      name: 'admin-offices',
      component: () => import('../views/CatalogAdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/positions',
      name: 'admin-positions',
      component: () => import('../views/CatalogAdminView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  try {
    const auth = useAuthStore();

    // Intenta cargar el perfil del usuario si hay un token pero no un objeto de usuario
    if (auth.token && !auth.user) {
      await auth.fetchProfile();
    }

    // Lógica de redirección
    const requiresAuth = to.meta.requiresAuth;
    const isAuthenticated = auth.isAuthenticated;

    if (requiresAuth && !isAuthenticated) {
      // Si la ruta requiere autenticación y el usuario no está logueado, redirigir a login
      auth.returnUrl = to.fullPath;
      return '/login';
    }

    if (to.name === 'login' && isAuthenticated) {
      // Si el usuario ya está logueado, no puede acceder a la página de login
      return { name: 'home' };
    }

    // Si no se cumple ninguna de las condiciones de redirección, permite la navegación.
    return true;
  } catch (error) {
    // Si hay un error al verificar el token (ej. expirado), limpiar la sesión y redirigir a login
    console.error("Error en el guardia de navegación (probablemente token inválido):", error);
    const auth = useAuthStore();
    auth.logout();
    return '/login';
  }
});

export default router