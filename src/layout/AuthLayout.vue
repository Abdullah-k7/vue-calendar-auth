<script setup>
import { computed, watchEffect } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

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
</script>

<template>
  <div
    class="min-h-screen bg-slate-100"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Top Navbar -->
    <header
      class="h-16 shrink-0 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between"
    >
      <RouterLink to="/calendar" class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm"
        >
          C
        </div>

        <div>
          <h1 class="text-sm sm:text-base font-bold text-slate-900">Vue Calendar Auth</h1>
    
          <p class="hidden sm:block text-xs text-slate-500">Firebase Authentication</p>
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

    <!-- Auth Pages -->
    <main class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <RouterView />
    </main>
  </div>
</template>