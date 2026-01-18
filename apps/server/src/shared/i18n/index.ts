import i18next from 'i18next'
import { i18nLocales } from 'shared'
import zhTranslations from './locales/zh.json'
import enTranslations from './locales/en.json'

// Merge shared validation translations with server-specific translations
const zhMerged = { ...zhTranslations, ...i18nLocales.zh }
const enMerged = { ...enTranslations, ...i18nLocales.en }

await i18next.init({
  lng: 'zh',
  fallbackLng: 'en',
  resources: {
    zh: { translation: zhMerged },
    en: { translation: enMerged },
  },
  interpolation: {
    escapeValue: false,
  },
})

export const t = i18next.t.bind(i18next)
export const changeLanguage = i18next.changeLanguage.bind(i18next)
export { i18next }
