import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authenticate, currentUser, revokeCurrentSession } from './auth.server'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(() => currentUser())

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email(), password: z.string().min(8).max(200) }))
  .handler(async ({ data }) => {
    const user = await authenticate(data.email, data.password)
    if (!user) return { ok: false as const, message: 'E-mail ou senha inválidos.' }
    return { ok: true as const }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await revokeCurrentSession()
  return { ok: true }
})
