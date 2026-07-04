import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import AuthLayout from '@/layout/AuthLayout.vue'
import MainLayout from '@/layout/MainLayout.vue'

import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import CalendarView from '@/views/CalendarView.vue'
import EventsVuiw from '@/views/EventsView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'calendar',
          component: CalendarView,
          meta: {
            requiresAuth: true,
            requiresVerified: true,
          },
        },
        {
          path: 'events',
          name: 'events',
          component: EventsVuiw,
          meta: {
            requiresAuth: true,
            requiresVerified: true,
          }
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            requiresAuth: true,
            requiresVerified: true,
          }
        }
      ],
    },

    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: {
            guestOnly: true,
          },
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
          meta: {
            guestOnly: true,
          },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: ForgotPasswordView,
          meta: {
            guestOnly: true,
          },
        },
        {
          path: 'verify-email',
          name: 'verify-email',
          component: VerifyEmailView,
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },

    {
      path: '/calendar',
      redirect: '/',
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

let authReady = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authReady) {
    await authStore.init()
    authReady = true
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresVerified && !authStore.isEmailVerified) {
    return { name: 'verify-email' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return authStore.isEmailVerified
      ? { name: 'calendar' }
      : { name: 'verify-email' }
  }
})

export default router