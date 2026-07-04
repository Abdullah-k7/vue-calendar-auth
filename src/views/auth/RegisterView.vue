<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

async function handleRegister() {
  localError.value = ''
  authStore.clearMessages()

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    localError.value = t('auth.errors.fillAllFields')
    return
  }

  if (password.value.length < 6) {
    localError.value = t('auth.errors.passwordLength')
    return
  }

  if (password.value !== confirmPassword.value) {
    localError.value = t('auth.errors.passwordMismatch')
    return
  }

  try {
    await authStore.register(name.value, email.value, password.value)
    router.replace('/verify-email')
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
        {{ t('auth.register.title') }}
      </h1>

      <p class="text-slate-500 mt-2 text-sm">
        {{ t('auth.register.subtitle') }}
      </p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          {{ t('common.fullName') }}
        </label>

        <input
          v-model="name"
          type="text"
          :placeholder="t('auth.placeholders.fullName')"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

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

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          {{ t('common.password') }}
        </label>

        <input
          v-model="password"
          type="password"
          :placeholder="t('auth.placeholders.createPassword')"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">
          {{ t('common.confirmPassword') }}
        </label>

        <input
          v-model="confirmPassword"
          type="password"
          :placeholder="t('auth.placeholders.confirmPassword')"
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
        v-if="authStore.success"
        class="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
      >
        {{ authStore.success }}
      </div>

      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.loading">
          {{ t('auth.register.loading') }}
        </span>

        <span v-else>
          {{ t('auth.register.button') }}
        </span>
      </button>
    </form>

    <p class="text-center text-sm text-slate-500 mt-6">
      {{ t('auth.register.alreadyHaveAccount') }}

      <RouterLink
        to="/login"
        class="text-indigo-600 font-semibold hover:underline"
      >
        {{ t('auth.register.login') }}
      </RouterLink>
    </p>

    <div class="mt-6 border-t border-slate-200 pt-5">
      <p class="text-xs text-center text-slate-400">
        {{ t('app.secureLogin') }}
      </p>
    </div>
  </div>
</template>