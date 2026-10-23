import { createFileRoute } from '@tanstack/react-router'
import { isValidJourneyEventsSecret, parseJourneyEvent, processJourneyEvent } from '../../../../lib/journey-events.server'

const SECRET_HEADER = 'x-journey-events-secret'

export const Route = createFileRoute('/api/internal/journey/events')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isValidJourneyEventsSecret(request.headers.get(SECRET_HEADER))) {
          return Response.json({ error: 'unauthorized' }, { status: 401 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'invalid_request' }, { status: 400 })
        }
        const parsed = parseJourneyEvent(body)
        if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 })

        const result = await processJourneyEvent(parsed.data)
        return Response.json(result, { status: 200 })
      },
    },
  },
})
