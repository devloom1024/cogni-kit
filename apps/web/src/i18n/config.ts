import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { i18nLocales } from 'shared'
import webZh from './locales/zh.json'
import webEn from './locales/en.json'

// Merge web translations with shared validation translations
const zhMerged = { ...webZh, ...i18nLocales.zh }
const enMerged = { ...webEn, ...i18nLocales.en }

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'zh'],
        debug: import.meta.env.DEV,

        resources: {
            zh: { translation: zhMerged },
            en: { translation: enMerged },
        },

        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
