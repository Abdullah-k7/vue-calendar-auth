import { defineStore } from 'pinia'

import {
  isSupported,
  onRegistered,
  register,
} from 'firebase/messaging'

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

import {
  auth,
  db,
  messaging,
} from '@/firebase/firebase'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    permission: Notification.permission,
    enabled: Notification.permission === 'granted',
    installationId: null,
    loading: false,
    error: null,
  }),

  actions: {
    async saveInstallation(installationId) {
      const user = auth.currentUser

      if (!user) {
        throw new Error('You must be logged in.')
      }

      const deviceRef = doc(
        db,
        'users',
        user.uid,
        'devices',
        installationId
      )

      await setDoc(
        deviceRef,
        {
          installationId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      this.installationId = installationId
    },

    async enableNotifications() {
      this.error = null
      this.loading = true

      try {
        const supported = await isSupported()

        if (!supported) {
          throw new Error(
            'Notifications are not supported in this browser.'
          )
        }

        const permission =
          await Notification.requestPermission()

        this.permission = permission

        if (permission !== 'granted') {
          throw new Error(
            'Notification permission was not granted.'
          )
        }

        this.enabled = true

        onRegistered(
          messaging,
          async (installationId) => {
            try {
              await this.saveInstallation(
                installationId
              )

              console.log(
                'FCM Installation ID:',
                installationId
              )
            } catch (error) {
              console.error(
                'Error saving installation:',
                error
              )
            }
          }
        )

        await register(messaging, {
          vapidKey:
            import.meta.env.VITE_FIREBASE_VAPID_KEY,
        })
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})