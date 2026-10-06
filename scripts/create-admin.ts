import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import pg from 'pg'
import { hashPassword } from '../src/lib/password.server.js'

const ADMIN_ROLE_CODE = 'administrator'
const MIN_PASSWORD_LENGTH = 8

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function readHidden(prompt: string): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY || !stdin.setRawMode) {
    throw new Error('Este comando exige um terminal interativo para proteger a senha.')
  }

  stdout.write(prompt)
  stdin.setRawMode(true)
  stdin.resume()

  return new Promise((resolve, reject) => {
    let value = ''
    const onData = (chunk: Buffer) => {
      const key = chunk.toString('utf8')
      if (key === '\u0003') {
        cleanup()
        reject(new Error('Operação cancelada.'))
      } else if (key === '\r' || key === '\n') {
        cleanup()
        stdout.write('\n')
        resolve(value)
      } else if (key === '\u007f' || key === '\b') {
        value = value.slice(0, -1)
      } else if (!key.startsWith('\u001b')) {
        value += key
      }
    }
    const cleanup = () => {
      stdin.off('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
    }
    stdin.on('data', onData)
  })
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não configurada.')
  process.exit(1)
}

if (!stdin.isTTY || !stdout.isTTY) {
  console.error('Use um terminal interativo; argumentos e pipe para senha não são aceitos.')
  process.exit(1)
}

if (process.argv.length > 2) {
  console.error('Este comando não aceita argumentos. Informe os dados apenas nos prompts interativos.')
  process.exit(1)
}

const prompt = createInterface({ input: stdin, output: stdout })
let pool: pg.Pool | undefined

try {
  const name = (await prompt.question('Nome: ')).trim()
  const email = normalizeEmail(await prompt.question('Email: '))
  prompt.close()

  const password = await readHidden('Senha: ')
  const passwordConfirmation = await readHidden('Confirmar senha: ')

  if (name.length < 2 || name.length > 160) throw new Error('Nome deve ter entre 2 e 160 caracteres.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email inválido.')
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  if (password !== passwordConfirmation) throw new Error('As senhas não conferem.')

  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  const client = await pool.connect()
  try {
    await client.query('begin')

    const existingUser = await client.query('select 1 from users where email = $1 limit 1', [email])
    if (existingUser.rowCount) throw new Error('Já existe um usuário com este email.')

    const role = await client.query<{ id: string }>('select id from roles where code = $1 limit 1', [ADMIN_ROLE_CODE])
    if (!role.rows[0]) throw new Error('Perfil Administrador não encontrado. Aplique as migrations antes de criar o usuário.')

    const passwordHash = await hashPassword(password)
    const user = await client.query<{ id: string }>(
      `insert into users (name, email, password_hash, status)
       values ($1, $2, $3, 'active')
       returning id`,
      [name, email, passwordHash],
    )
    await client.query('insert into user_roles (user_id, role_id) values ($1, $2)', [user.rows[0].id, role.rows[0].id])
    await client.query(
      `insert into audit_logs (entity_type, entity_id, action, new_values)
       values ('user', $1, 'created', jsonb_build_object('email', $2::text, 'role', $3::text))`,
      [user.rows[0].id, email, ADMIN_ROLE_CODE],
    )
    await client.query('commit')
    console.log('Usuário administrador criado com sucesso.')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Não foi possível criar o usuário administrador.')
  process.exitCode = 1
} finally {
  prompt.close()
  await pool?.end()
}
