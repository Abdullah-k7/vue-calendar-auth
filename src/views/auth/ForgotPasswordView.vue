<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const { t, locale } = useI18n()

const email = ref('')
const localError = ref('')
const localSuccess = ref('')

async function handleResetPassword() {
  localError.value = ''
  localSuccess.value = ''
  authStore.clearMessages()

  if (!email.value) {
    localError.value = t('auth.errors.emailRequired')
    return
  }

  try {
    await authStore.resetPassword(email.value)

    authStore.clearMessages()
    localSuccess.value = t('auth.success.resetSent')
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
    <div class="text-start mb-8">
      <div
        class="mb-5 h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center"
      >
        <span class="text-2xl">🔐</span>
      </div>

      <h1 class="text-2xl font-bold text-slate-900">
        {{ t('auth.forgotPassword.title') }}
      </h1>

      <p class="text-slate-500 mt-2 text-sm leading-relaxed">
        {{ t('auth.forgotPassword.subtitle') }}
      </p>
    </div>

    <form @submit.prevent="handleResetPassword" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          {{ t('common.email') }}
        </label>

        <input
          v-model="email"
          type="email"
          :placeholder="t('auth.placeholders.email')"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div
        v-if="localError || authStore.error"
        class="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
      >
        {{ localError || authStore.error }}
      </div>

      <div
        v-if="localSuccess || authStore.success"
        class="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
      >
        {{ localSuccess || authStore.success }}
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.loading">
          {{ t('auth.forgotPassword.loading') }}
        </span>

        <span v-else>
          {{ t('auth.forgotPassword.button') }}
        </span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <RouterLink
        to="/login"
        class="text-sm text-indigo-600 font-semibold hover:underline"
      >
        {{ t('common.backToLogin') }}
      </RouterLink>
    </div>

    <div class="mt-6 border-t border-slate-200 pt-5">
      <p class="text-xs text-center text-slate-400">
        {{ t('auth.forgotPassword.footer') }}
      </p>
    </div>
  </div>
</template>