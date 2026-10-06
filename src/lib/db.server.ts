import '@tanstack/react-start/server-only'
import pg from 'pg'

const { Pool } = pg

declare global {
  var __crmPool: pg.Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada')
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: 'crm-projetos',
  })
}

export function getPool() {
  globalThis.__crmPool ??= createPool()
  return globalThis.__crmPool
}

export async function query<T extends pg.QueryResultRow>(text: string, values: readonly unknown[] = []) {
  return getPool().query<T>(text, [...values])
}

export async function transaction<T>(work: (client: pg.PoolClient) => Promise<T>) {
  const client = await getPool().connect()
  try {
    await client.query('begin')
    const result = await work(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
