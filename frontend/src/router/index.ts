import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
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
    {
      path: '/admin/templates',
      name: 'template-manager',
      component: () => import('../views/TemplateManager.vue'),
      meta: { requiresAuth: true, role: 'admin' } // Proteger la ruta
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore();

    // Intenta cargar el perfil del usuario si hay un token pero no un objeto de usuario
    if (authStore.token && !authStore.user) {
      await authStore.fetchProfile();
    }

    // Lógica de redirección
    const requiresAuth = to.meta.requiresAuth;
    const isAuthenticated = authStore.isAuthenticated;
    const requiredRole = to.meta.role as string | undefined;

    if (requiresAuth && !isAuthenticated) {
      // Si la ruta requiere autenticación y el usuario no está logueado, redirigir a login
      authStore.returnUrl = to.fullPath;
      return next('/login');
    }

    if (to.name === 'login' && isAuthenticated) {
      // Si el usuario ya está logueado, no puede acceder a la página de login
      return next({ name: 'home' });
    }

    // --- CORRECCIÓN ---
    // Verifica si la ruta requiere un rol y si el usuario no cumple con él.
    // Se ha añadido una comprobación para 'isAdmin' para que coincida con la lógica del menú.
    const isRoleCheckFailed = requiredRole === 'admin' 
      ? !authStore.user?.isAdmin 
      : requiredRole && authStore.user?.role !== requiredRole;

    if (isRoleCheckFailed) {
      return next({ name: 'home' }); 
    }

    // Todo en orden, continuar a la ruta solicitada.
    next();
  } catch (error) {
    // Si hay un error al verificar el token (ej. expirado), limpiar la sesión y redirigir a login
    console.error("Error en el guardia de navegación (probablemente token inválido):", error);
    const auth = useAuthStore();
    auth.logout();
    // No se usa `next` aquí porque `auth.logout()` ya redirige.
  }
});

export default router