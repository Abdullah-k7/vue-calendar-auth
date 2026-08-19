import { defineStore } from 'pinia'
import { auth } from '@/firebase/firebase'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  reload,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,

} from 'firebase/auth'

function mapUser(user) {
  if (!user) return null

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  }
}

function getAuthErrorMessage(error) {
  const errors = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  }

  return errors[error.code] || error.message || 'Something went wrong.'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
    error: null,
    success: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isEmailVerified: (state) => !!state.user?.emailVerified,
  },

  actions: {
    init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (firebaseUser) => {
          this.user = mapUser(firebaseUser)
          this.loading = false
          resolve(firebaseUser)
        })
      })
    },

    clearMessages() {
      this.error = null
      this.success = null
    },

    async register(name, email, password) {
      this.clearMessages()
      this.loading = true

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        await updateProfile(userCredential.user, {
          displayName: name,
        })

        await sendEmailVerification(userCredential.user)
        await reload(userCredential.user)

        this.user = mapUser(userCredential.user)
        this.success = 'Account created. Please check your email.'

        return userCredential.user
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.clearMessages()
      this.loading = true

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        await reload(userCredential.user)
        this.user = mapUser(userCredential.user)

        return userCredential.user
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async resendVerificationEmail() {
      this.clearMessages()

      try {
        if (!auth.currentUser) {
          throw new Error('You must be logged in first.')
        }

        await sendEmailVerification(auth.currentUser)
        this.success = 'Verification email sent again.'
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      }
    },

    async refreshUser() {
      this.clearMessages()

      try {
        if (!auth.currentUser) return

        await reload(auth.currentUser)
        this.user = mapUser(auth.currentUser)

        if (this.user.emailVerified) {
          this.success = 'Email verified successfully.'
        }
      } catch (error) {
        this.error = getAuthErrorMessage(error)
      }
    },

    async resetPassword(email) {
      this.clearMessages()
      this.loading = true

      try {
        await sendPasswordResetEmail(auth, email)
        this.success = 'Password reset link sent to your email.'
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
    },

    async changePassword(currentPassword, newPassword) {
      this.clearMessages()
      this.loading = true

      try {
        const user = auth.currentUser

        if (!user || !user.email) {
          throw new Error('You must be logged in.')
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        )

        await reauthenticateWithCredential(user, credential)

        await updatePassword(user, newPassword)

        this.success = 'Password changed successfully.'
      } catch (error) {
        if (error.code === 'auth/invalid-credential') {
          this.error = 'Current password is incorrect.'
        } else {
          this.error = getAuthErrorMessage(error)
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    async reauthenticate(password) {
      const user = auth.currentUser

      if (!user || !user.email) {
        throw new Error('You must be logged in.')
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        password
      )

      await reauthenticateWithCredential(
        user,
        credential
      )
    },

    async deleteAccount() {
      this.clearMessages()

      try {
        const user = auth.currentUser

        if (!user) {
          throw new Error('You must be logged in.')
        }

        await deleteUser(user)

        this.user = null
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      }
    },
  },
})