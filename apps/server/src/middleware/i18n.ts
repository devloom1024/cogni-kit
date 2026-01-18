import type { Context, Next } from 'hono'
import { i18next } from '../shared/i18n/index.js'
import type { TFunction } from 'i18next'

export const i18nMiddleware = async (c: Context, next: Next) => {
    const lang = c.req.header('Accept-Language') || 'zh'

    // Use getFixedT for request-scoped translation without cloning the entire instance
    const t = i18next.getFixedT(lang)

    c.set('t', t)
    return await next()
}

declare module 'hono' {
    interface ContextVariableMap {
        t: TFunction
    }
}
