import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.use(OneSignalVuePlugin, {
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,

    serviceWorkerPath:
        'onesignal/OneSignalSDKWorker.js',

    serviceWorkerParam: {
        scope: '/onesignal/',
    },
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.use(OneSignalVuePlugin, {
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,

    serviceWorkerPath:
        'onesignal/OneSignalSDKWorker.js',

    serviceWorkerParam: {
        scope: '/onesignal/',
    },
})

app.mount('#app')