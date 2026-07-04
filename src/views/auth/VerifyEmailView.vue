<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const checking = ref(false)
const localError = ref('')
const localSuccess = ref('')

function clearMessages() {
  localError.value = ''
  localSuccess.value = ''
  authStore.clearMessages()
}

async function handleResendEmail() {
  clearMessages()

  try {
    await authStore.resendVerificationEmail()
    authStore.clearMessages()
    localSuccess.value = t('auth.success.verificationSent')
  } catch (error) {
    console.log(error)
  }
}

async function handleCheckVerification() {
  clearMessages()
  checking.value = true

  try {
    await authStore.refreshUser()

    if (authStore.isEmailVerified) {
      authStore.clearMessages()
      localSuccess.value = t('auth.success.emailVerified')
      router.replace('/')
    } else {
      authStore.clearMessages()
      localError.value = t('auth.verifyEmail.notVerifiedYet')
    }
  } finally {
    checking.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.replace('/login')
}

onMounted(async () => {
  await authStore.refreshUser()

  if (authStore.isEmailVerified) {
    router.replace('/')
  } else {
    authStore.clearMessages()
  }
})
</script>

<template>
  <div
    class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <div
      class="mx-auto mb-5 h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center"
    >
      <span class="text-3xl">📧</span>
    </div>

    <h1 class="text-2xl font-bold text-slate-900">
      {{ t('auth.verifyEmail.title') }}
    </h1>

    <p class="text-slate-500 mt-3">
      {{ t('auth.verifyEmail.sentTo') }}
    </p>

    <p class="font-semibold text-slate-800 mt-1">
      {{ authStore.user?.email }}
    </p>

    <p class="text-sm text-slate-500 mt-4 leading-relaxed">
      {{ t('auth.verifyEmail.description') }}
    </p>

    <div
      v-if="localError || authStore.error"
      class="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
    >
      {{ localError || authStore.error }}
    </div>

    <div
      v-if="localSuccess || authStore.success"
      class="mt-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm"
    >
      {{ localSuccess || authStore.success }}
    </div>

    <div class="mt-7 space-y-3">
      <button
        @click="handleCheckVerification"
        :disabled="checking"
        class="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="checking">
          {{ t('auth.verifyEmail.checking') }}
        </span>

        <span v-else>
          {{ t('auth.verifyEmail.verifiedButton') }}
        </span>
      </button>

      <button
        @click="handleResendEmail"
        class="w-full rounded-xl border border-slate-300 text-slate-700 py-3 font-semibold hover:bg-slate-50 transition"
      >
        {{ t('auth.verifyEmail.resendButton') }}
      </button>

      <button
        @click="handleLogout"
        class="w-full rounded-xl text-red-600 py-3 font-semibold hover:bg-red-50 transition"
      >
        {{ t('common.logout') }}
      </button>
    </div>
  </div>
</template>