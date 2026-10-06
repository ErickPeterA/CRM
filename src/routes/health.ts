import { createFileRoute } from '@tanstack/react-router'
import { query } from '../lib/db.server'

export const Route = createFileRoute('/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await query('select 1')
          return Response.json({ status: 'ok', database: 'crm_projetos' }, { status: 200 })
        } catch {
          return Response.json({ status: 'unavailable', database: 'crm_projetos' }, { status: 503 })
        }
      },
    },
  },
})
