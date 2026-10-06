import argon2 from 'argon2'
import pg from 'pg'

const [name, email, password, role = 'administrator'] = process.argv.slice(2)
if (!name || !email || !password) {
  console.error('Uso: npm run user:create -- "Nome" email@empresa.com "senha-forte" [role-code]')
  process.exit(1)
}
if (password.length < 12) {
  console.error('A senha inicial deve ter pelo menos 12 caracteres.')
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não configurada.')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const client = await pool.connect()
try {
  await client.query('begin')
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })
  const user = await client.query<{ id: string }>(
    `insert into users (name,email,password_hash) values ($1,$2,$3)
     on conflict (email) do update set name=excluded.name,password_hash=excluded.password_hash,status='active',updated_at=now()
     returning id`,
    [name, email.toLowerCase(), passwordHash],
  )
  const assigned = await client.query(
    `insert into user_roles (user_id,role_id)
     select $1,id from roles where code=$2 on conflict do nothing`,
    [user.rows[0].id, role],
  )
  if (assigned.rowCount === 0) throw new Error(`Perfil inexistente ou já atribuído: ${role}`)
  await client.query('commit')
  console.log(`Usuário criado: ${email} (${role})`)
} catch (error) {
  await client.query('rollback')
  console.error(error instanceof Error ? error.message : 'Falha ao criar usuário')
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
