import { createI18n } from 'vue-i18n'
import { messages } from './messages'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
})

export default i18n