// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/documents/create',
      name: 'create-document',
      component: () => import('../views/CreateDocumentView.vue'),
      meta: { requiresAuth: true }
    },
    {
    path: '/documents/:id/upload',
    name: 'upload-document',
    component: () => import('../views/UploadDocumentView.vue'),
    meta: { requiresAuth: true }
    },
    {
    path: '/routes/create',
    name: 'create-route',
    component: () => import('../views/CreateRouteView.vue'),
    meta: { requiresAuth: true }
    },
    {
    path: '/enviados',
    name: 'sent-routes',
    component: () => import('../views/SentRoutesView.vue'),
    meta: { requiresAuth: true }
    },

    {
    path: '/entrada',
    name: 'incoming',
    component: () => import('../views/IncomingView.vue'),
    meta: { requiresAuth: true }
    },
    {
    path: '/pendientes',
    name: 'pending',
    component: () => import('../views/PendingView.vue'),
    meta: { requiresAuth: true }
    },
    {
    path: '/archivados',
    name: 'archived',
    component: () => import('../views/ArchivedView.vue'),
    meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});

export default router;