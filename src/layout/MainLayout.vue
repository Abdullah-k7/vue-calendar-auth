<script setup>
import { computed, watchEffect } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const isArabic = computed(() => locale.value === 'ar')

function toggleLanguage() {
  const newLocale = isArabic.value ? 'en' : 'ar'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

watchEffect(() => {
  document.documentElement.lang = locale.value
  document.documentElement.dir = isArabic.value ? 'rtl' : 'ltr'
})

async function handleLogout() {
  await authStore.logout()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 flex flex-col"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Top Navbar -->
    <header
      class="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between"
    >
      <RouterLink
        :to="{ name: 'calendar' }"
        class="flex items-center gap-3"
      >
        <div
          class="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm"
        >
          C
        </div>

        <div>
          <h1 class="text-sm sm:text-base font-bold text-slate-900">
            Vue Calendar Auth
          </h1>

          <p
            v-if="authStore.user?.email"
            class="hidden sm:block text-xs text-slate-500"
          >
            {{ authStore.user?.email }}
          </p>

          <p
            v-else
            class="hidden sm:block text-xs text-slate-500"
          >
            Firebase Authentication
          </p>
        </div>
      </RouterLink>

      <div class="flex items-center gap-3">
        <button
          @click="toggleLanguage"
          class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <span v-if="isArabic">EN</span>
          <span v-else>AR</span>
        </button>
      </div>
    </header>

    <!-- Page Body -->
    <div class="flex flex-1 min-h-[calc(100vh-4rem)]">
      <!-- Sidebar -->
      <aside
        class="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 px-8 py-5 flex-col"
      >
        <nav class="space-y-2 flex-1">
          <RouterLink
            :to="{ name: 'calendar' }"
            class="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            exact-active-class="bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white"
          >
            {{ t('layout.calendar') }}
          </RouterLink>

          <RouterLink
            :to="{ name: 'events' }"
            class="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            exact-active-class="bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white"
          >
            {{ t('layout.myEvents') }}
          </RouterLink>

          <RouterLink
            :to="{ name: 'profile' }"
            class="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            exact-active-class="bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white"
          >
            {{ t('layout.profile') }}
          </RouterLink>
        </nav>

        <button
          @click="handleLogout"
          class="rounded-xl text-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-50 text-start"
        >
          {{ t('common.logout') }}
        </button>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 bg-slate-100 p-4 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>