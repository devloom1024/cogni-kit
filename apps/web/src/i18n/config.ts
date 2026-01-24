import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { i18nLocales } from 'shared'
import webZh from './locales/zh.json'
import webEn from './locales/en.json'

// Merge web translations with shared validation translations
const deepMerge = (target: any, source: any): any => {
    if (typeof target !== 'object' || target === null) return source
    if (typeof source !== 'object' || source === null) return target

    const result = { ...target }
    for (const key in source) {
        if (key in target && typeof target[key] === 'object' && typeof source[key] === 'object') {
            result[key] = deepMerge(target[key], source[key])
        } else {
            result[key] = source[key]
        }
    }
    return result
}

const resources = {
    zh: { translation: deepMerge(webZh, i18nLocales.zh) },
    en: { translation: deepMerge(webEn, i18nLocales.en) },
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'zh'],
        debug: import.meta.env.DEV,

        resources,

        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
