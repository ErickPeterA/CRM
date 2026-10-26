import '@tanstack/react-start/server-only'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { currentUser, requirePermission } from './auth.server'
import { query, transaction } from './db.server'

const CODE_TTL_MS = 60_000

type JourneyUser = {
  user_id: string
  name: string
  email: string
  role: string | null
  permissions: string[]
}

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

function getJourneyAppUrl() {
  const value = process.env.JOURNEY_APP_URL
  if (!value) throw new Error('JOURNEY_APP_URL_NOT_CONFIGURED')
  return value
}

export async function createJourneySsoCode() {
  const user = await currentUser()
  if (!user) throw new Error('AUTHENTICATION_REQUIRED')

  return issueJourneySsoUrl(user.id)
}

export async function createJourneyResultSsoUrl(opportunityId:string) {
  const user = await requirePermission('commercial.read')
  const result = await query<{status:string|null;result_reference:string|null}>(
    `select j.status, j.result_reference
     from commercial_opportunities o
     left join journey_instances j on j.opportunity_id = o.id
     where o.id = $1 and o.archived_at is null`,
    [opportunityId],
  )
  const journey = result.rows[0]
  if (!journey) throw new Error('OPPORTUNITY_NOT_FOUND')
  if (!journey.status) throw new Error('JOURNEY_NOT_FOUND')
  if (journey.status !== 'completed' || !journey.result_reference) throw new Error('JOURNEY_RESULT_NOT_AVAILABLE')

  const next = `/gestao/resultados/${encodeURIComponent(journey.result_reference)}`
  return issueJourneySsoUrl(user.id,next)
}

async function issueJourneySsoUrl(userId:string,next?:string) {

  const url = new URL('/auth/sso', getJourneyAppUrl())
  const code = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + CODE_TTL_MS)

  await transaction(async (client) => {
    await client.query(
      'insert into sso_codes (code_hash, user_id, expires_at) values ($1, $2, $3)',
      [hashCode(code), userId, expiresAt],
    )
  })

  url.searchParams.set('code', code)
  if(next)url.searchParams.set('next',next)
  return url.toString()
}

export function isValidJourneySsoSecret(providedSecret: string | null) {
  const expectedSecret = process.env.JOURNEY_SSO_SECRET
  if (!expectedSecret || !providedSecret) return false

  const expected = Buffer.from(expectedSecret)
  const provided = Buffer.from(providedSecret)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export async function exchangeJourneySsoCode(code: string): Promise<JourneyUser | null> {
  const codeHash = hashCode(code)

  return transaction(async (client) => {
    const consumed = await client.query<{ user_id: string }>(
      `update sso_codes
       set used_at = now()
       where code_hash = $1
         and used_at is null
         and expires_at > now()
         and exists (
           select 1 from users
           where users.id = sso_codes.user_id
             and users.status = 'active'
             and users.deactivated_at is null
         )
       returning user_id`,
      [codeHash],
    )
    const userId = consumed.rows[0]?.user_id
    if (!userId) return null

    const user = await client.query<JourneyUser>(
      `select u.id as user_id, u.name, u.email::text,
         (array_agg(distinct r.code order by r.code) filter (where r.code is not null))[1] as role,
         coalesce(array_agg(distinct p.code) filter (where p.code is not null), '{}') as permissions
       from users u
       left join user_roles ur on ur.user_id = u.id
       left join roles r on r.id = ur.role_id
       left join role_permissions rp on rp.role_id = ur.role_id
       left join permissions p on p.id = rp.permission_id
       where u.id = $1
       group by u.id`,
      [userId],
    )
    return user.rows[0] ?? null
  })
}
