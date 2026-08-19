<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOneSignal } from '@onesignal/onesignal-vue3'

import { useAuthStore } from '@/stores/authStore'
import { useEventStore } from '@/stores/eventStore'

const router = useRouter()

const authStore = useAuthStore()
const eventStore = useEventStore()

const OneSignal = useOneSignal()

// ================================
// Notifications
// ================================

const notificationLoading = ref(false)
const notificationError = ref('')
const notificationsEnabled = ref(false)

onMounted(() => {
  try {
    notificationsEnabled.value =
      OneSignal.Notifications.permission && OneSignal.User.PushSubscription.optedIn === true
  } catch (error) {
    console.error('Error checking notifications:', error)
  }
})
async function handleEnableNotifications() {
  notificationError.value = ''
  notificationLoading.value = true

  try {
    const user = authStore.user

    if (!user?.uid) {
      throw new Error('You must be logged in.')
    }

    if (!OneSignal.Notifications.isPushSupported()) {
      throw new Error('Push notifications are not supported in this browser.')
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notifications are blocked. Please allow them from your browser settings.')
    }

    await OneSignal.login(user.uid)

    await OneSignal.User.PushSubscription.optIn()

    if (!OneSignal.Notifications.permission) {
      throw new Error('Notification permission was not granted.')
    }

    notificationsEnabled.value = OneSignal.User.PushSubscription.optedIn === true

    console.log('Notifications enabled')
    console.log('Subscription:', OneSignal.User.PushSubscription.id)
  } catch (error) {
    notificationError.value = error.message || 'Could not enable notifications.'

    console.error('OneSignal error:', error)
  } finally {
    notificationLoading.value = false
  }
}
// ================================
// Change Password
// ================================

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const localError = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleChangePassword() {
  localError.value = ''
  authStore.clearMessages()

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    localError.value = 'Please fill in all password fields.'
    return
  }

  if (newPassword.value.length < 6) {
    localError.value = 'New password must be at least 6 characters.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'New passwords do not match.'
    return
  }

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Error changing password:', error)
  }
}

// ================================
// Logout
// ================================

const showLogoutModal = ref(false)

async function handleLogout() {
  try {
    await authStore.logout()

    showLogoutModal.value = false

    router.replace({
      name: 'login',
    })

    // OneSignal لا يوقف عملية تسجيل الخروج
    OneSignal.logout().catch((error) => {
      console.warn('OneSignal logout failed:', error)
    })
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

// ================================
// Delete Account
// ================================

const showDeleteModal = ref(false)
const deletePassword = ref('')
const deleteError = ref('')

async function handleDeleteAccount() {
  deleteError.value = ''
  authStore.clearMessages()

  if (!deletePassword.value) {
    deleteError.value = 'Please enter your current password.'
    return
  }

  try {
    // 1. تأكيد كلمة المرور
    await authStore.reauthenticate(deletePassword.value)

    // 2. حذف Events
    await eventStore.deleteAllEvents()

    // 3. حذف Firebase account
    await authStore.deleteAccount()

    showDeleteModal.value = false
    deletePassword.value = ''

    router.replace({
      name: 'login',
    })

    // ما نخلي OneSignal يوقف حذف الحساب
    OneSignal.logout().catch((error) => {
      console.warn('OneSignal logout failed:', error)
    })
  } catch (error) {
    if (error.code === 'auth/invalid-credential') {
      deleteError.value = 'Current password is incorrect.'
    } else {
      deleteError.value = authStore.error || 'Could not delete account.'
    }

    console.error('Error deleting account:', error)
  }
}
</script>
<template>
  <div class="space-y-6">
    <!-- Account Information -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-xl font-bold text-slate-900">Profile</h1>

      <p class="mt-1 text-sm text-slate-500">Manage your account information.</p>

      <div class="mt-6 space-y-4">
        <div>
          <p class="text-xs font-semibold text-slate-400">Name</p>

          <p class="mt-1 font-semibold text-slate-800">
            {{ authStore.user?.displayName || 'No name' }}
          </p>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-400">Email</p>

          <p class="mt-1 font-semibold text-slate-800">
            {{ authStore.user?.email }}
          </p>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-400">Email Status</p>

          <span
            class="mt-1 inline-flex rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-600"
          >
            Verified
          </span>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Notifications</h2>

          <p class="mt-1 text-sm text-slate-500">Receive reminders before your calendar events.</p>
        </div>

        <span
          v-if="notificationsEnabled"
          class="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-600"
        >
          Enabled
        </span>
      </div>

      <div
        v-if="notificationError"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
      >
        {{ notificationError }}
      </div>

      <button
        v-if="!notificationsEnabled"
        type="button"
        @click="handleEnableNotifications"
        :disabled="notificationLoading"
        class="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {{ notificationLoading ? 'Enabling...' : '🔔 Enable Notifications' }}
      </button>

      <div v-else class="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
        Notifications are enabled on this device.
      </div>
    </div>

    <!-- Change Password -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-bold text-slate-900">Change Password</h2>

      <p class="mt-1 text-sm text-slate-500">Update the password for your account.</p>

      <form @submit.prevent="handleChangePassword" class="mt-6 space-y-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"> Current Password </label>

          <div class="relative">
            <input
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Current password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              :title="showCurrentPassword ? 'Hide password' : 'Show password'"
            >
              <!-- Eye -->
              <svg
                v-if="!showCurrentPassword"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6S2.25 12 2.25 12Z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <!-- Eye Off -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.3A10.8 10.8 0 0112 4c6 0 9.75 8 9.75 8a17.6 17.6 0 01-3.1 4.1M6.2 6.2C3.8 8.2 2.25 12 2.25 12S6 20 12 20a10 10 0 004.1-.9"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700"> New Password </label>

          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="New password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <svg
                v-if="!showNewPassword"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6S2.25 12 2.25 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.3A10.8 10.8 0 0112 4c6 0 9.75 8 9.75 8a17.6 17.6 0 01-3.1 4.1M6.2 6.2C3.8 8.2 2.25 12 2.25 12S6 20 12 20a10 10 0 004.1-.9"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">
            Confirm New Password
          </label>

          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <svg
                v-if="!showConfirmPassword"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6S2.25 12 2.25 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="h-5 w-5"
              >
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.3A10.8 10.8 0 0112 4c6 0 9.75 8 9.75 8a17.6 17.6 0 01-3.1 4.1M6.2 6.2C3.8 8.2 2.25 12 2.25 12S6 20 12 20a10 10 0 004.1-.9"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          v-if="localError || authStore.error"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ localError || authStore.error }}
        </div>

        <div
          v-if="authStore.success"
          class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {{ authStore.success }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ authStore.loading ? 'Changing password...' : 'Change Password' }}
        </button>
      </form>
    </div>

    <!-- Logout -->
    <div class="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-bold text-slate-900">Account Actions</h2>

      <p class="mt-1 text-sm text-slate-500">Sign out or permanently delete your account.</p>

      <div class="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          @click="showLogoutModal = true"
          class="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Logout
        </button>

        <button
          type="button"
          @click="showDeleteModal = true"
          class="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Delete Account
        </button>
      </div>
    </div>
    <!-- Delete Account Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      @click.self="showDeleteModal = false"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
          ⚠️
        </div>

        <h2 class="text-xl font-bold text-slate-900">Delete Account?</h2>

        <p class="mt-2 text-sm leading-relaxed text-slate-500">
          This will permanently delete your account and all of your calendar events. This action
          cannot be undone.
        </p>

        <div class="mt-5">
          <label class="mb-1 block text-sm font-semibold text-slate-700"> Current Password </label>

          <input
            v-model="deletePassword"
            type="password"
            placeholder="Enter your current password"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div
          v-if="deleteError"
          class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ deleteError }}
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="handleDeleteAccount"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      @click.self="showLogoutModal = false"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 class="text-lg font-bold text-slate-900">Sign Out?</h2>

        <p class="mt-2 text-sm text-slate-500">
          Are you sure you want to sign out of your account?
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="showLogoutModal = false"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="handleLogout"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>