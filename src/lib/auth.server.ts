import '@tanstack/react-start/server-only'
import { createHash, randomBytes } from 'node:crypto'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { query, transaction } from './db.server'
import { verifyPassword } from './password.server'

const COOKIE_NAME = 'crm_session'
const SESSION_DAYS = 8

export type SessionUser = {
  id: string
  name: string
  email: string
  permissions: string[]
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function authenticate(email: string, password: string) {
  const result = await query<{ id: string; name: string; email: string; password_hash: string }>(
    `select id, name, email::text, password_hash from users
     where email = $1 and status = 'active' and deactivated_at is null`,
    [email.trim().toLowerCase()],
  )
  const user = result.rows[0]
  if (!user || !(await verifyPassword(user.password_hash, password))) return null

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await transaction(async (client) => {
    await client.query(
      'insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)',
      [user.id, hashToken(token), expiresAt],
    )
    await client.query('update users set last_login_at = now() where id = $1', [user.id])
  })
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
  return { id: user.id, name: user.name, email: user.email }
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = getCookie(COOKIE_NAME)
  if (!token) return null
  const result = await query<SessionUser & { session_id: string }>(
    `select u.id, u.name, u.email::text,
       coalesce(array_agg(distinct p.code) filter (where p.code is not null), '{}') as permissions,
       s.id as session_id
     from sessions s
     join users u on u.id = s.user_id
     left join user_roles ur on ur.user_id = u.id
     left join role_permissions rp on rp.role_id = ur.role_id
     left join permissions p on p.id = rp.permission_id
     where s.token_hash = $1 and s.revoked_at is null and s.expires_at > now()
       and u.status = 'active' and u.deactivated_at is null
     group by u.id, s.id`,
    [hashToken(token)],
  )
  const user = result.rows[0]
  if (!user) return null
  await query('update sessions set last_seen_at = now() where id = $1 and last_seen_at < now() - interval \'5 minutes\'', [user.session_id])
  return { id: user.id, name: user.name, email: user.email, permissions: user.permissions }
}

export async function requirePermission(permission: string) {
  const user = await currentUser()
  if (!user) throw new Error('AUTHENTICATION_REQUIRED')
  if (!user.permissions.includes(permission) && !user.permissions.includes('admin.manage')) {
    throw new Error('PERMISSION_DENIED')
  }
  return user
}

export async function revokeCurrentSession() {
  const token = getCookie(COOKIE_NAME)
  if (token) await query('update sessions set revoked_at = now() where token_hash = $1 and revoked_at is null', [hashToken(token)])
  setCookie(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 })
}
