import { createFileRoute } from '@tanstack/react-router'
import { exchangeJourneySsoCode, isValidJourneySsoSecret } from '../../../../../lib/journey-sso.server'

const SECRET_HEADER = 'x-journey-sso-secret'

export const Route = createFileRoute('/api/internal/sso/journey/exchange')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isValidJourneySsoSecret(request.headers.get(SECRET_HEADER))) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'invalid_request' }, { status: 400 })
        }
        const code = typeof body === 'object' && body !== null && 'code' in body ? body.code : null
        if (typeof code !== 'string' || !code) {
          return Response.json({ error: 'invalid_request' }, { status: 400 })
        }

        const user = await exchangeJourneySsoCode(code)
        if (!user) return Response.json({ error: 'invalid_code' }, { status: 401 })
        return Response.json(user, { status: 200 })
      },
    },
  },
})
