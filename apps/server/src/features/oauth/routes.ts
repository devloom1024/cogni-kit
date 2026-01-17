import { Hono } from 'hono'
import { githubOAuth } from './github.js'
import { googleOAuth } from './google.js'
import { SocialProvider } from 'shared'

const oauth = new Hono()

oauth.get('/:provider/url', async (c) => {
  const provider = c.req.param('provider') as string
  const redirectUri = c.req.query('redirectUri')

  try {
    let url: string

    switch (provider) {
      case SocialProvider.github:
        url = githubOAuth.getAuthUrl(redirectUri)
        break
      case SocialProvider.google:
        url = googleOAuth.getAuthUrl(redirectUri)
        break
      default:
        return c.json({ code: 'oauth.invalid_provider', message: 'Invalid OAuth provider' }, 400)
    }

    return c.json({ url })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not configured')) {
      return c.json({ code: 'oauth.not_configured', message: error.message }, 503)
    }
    throw error
  }
})

oauth.post('/:provider/callback', async (c) => {
  const provider = c.req.param('provider') as string
  const body = await c.req.json()
  const { code, redirectUri } = body

  if (!code) {
    return c.json({ code: 'oauth.missing_code', message: 'Authorization code is required' }, 400)
  }

  try {
    let result

    switch (provider) {
      case SocialProvider.github:
        result = await githubOAuth.handleCallback(code, redirectUri)
        break
      case SocialProvider.google:
        result = await googleOAuth.handleCallback(code, redirectUri)
        break
      default:
        return c.json({ code: 'oauth.invalid_provider', message: 'Invalid OAuth provider' }, 400)
    }

    return c.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return c.json({ code: 'oauth.not_configured', message: error.message }, 503)
      }
      if (error.message.includes('not active')) {
        return c.json({ code: 'oauth.account_not_active', message: error.message }, 403)
      }
    }
    throw error
  }
})

export { oauth }
