<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const email = ref('')
const password = ref('')
const localError = ref('')

async function handleLogin() {
  localError.value = ''
  authStore.clearMessages()

  if (!email.value || !password.value) {
    localError.value = t('auth.errors.emailPasswordRequired')
    return
  }

  try {
    await authStore.login(email.value, password.value)

    if (authStore.isEmailVerified) {
      router.replace('/')
    } else {
      router.replace('/verify-email')
    }
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div
    class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <div class="text-center mb-8">
      <div
        class="mx-auto mb-4 h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md"
      >
        <span class="text-white text-2xl font-bold">C</span>
      </div>

      <h1 class="text-2xl font-bold text-slate-900">
        {{ t('auth.login.title') }}
      </h1>

      <p class="text-slate-500 mt-2 text-sm">
        {{ t('auth.login.subtitle') }}
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          {{ t('common.email') }}
        </label>

        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-slate-700">
            {{ t('common.password') }}
          </label>

          <RouterLink
            to="/forgot-password"
            class="text-sm text-indigo-600 font-semibold hover:underline"
          >
            {{ t('auth.login.forgotPassword') }}
          </RouterLink>
        </div>

        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div
        v-if="localError || authStore.error"
        class="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
      >
        {{ localError || authStore.error }}
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.loading">
          {{ t('auth.login.loading') }}
        </span>

        <span v-else>
          {{ t('auth.login.button') }}
        </span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-slate-500">
        {{ t('auth.login.noAccount') }}

        <RouterLink
          to="/register"
          class="text-indigo-600 font-semibold hover:underline"
        >
          {{ t('auth.login.register') }}
        </RouterLink>
      </p>
    </div>

    <div class="mt-6 border-t border-slate-200 pt-5">
      <p class="text-xs text-center text-slate-400">
        {{ t('app.secureLogin') }}
      </p>
    </div>
  </div>
</template>