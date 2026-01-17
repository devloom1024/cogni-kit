import i18next from 'i18next'
import zhTranslations from './locales/zh.json'
import enTranslations from './locales/en.json'

await i18next.init({
  lng: 'zh',
  fallbackLng: 'en',
  resources: {
    zh: { translation: zhTranslations },
    en: { translation: enTranslations },
  },
  interpolation: {
    escapeValue: false,
  },
})

export const t = i18next.t.bind(i18next)
export const changeLanguage = i18next.changeLanguage.bind(i18next)
