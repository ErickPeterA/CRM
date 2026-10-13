import pg from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL nao configurada.')

const pool = new pg.Pool({ connectionString, application_name: 'crm-projetos-demo-seed' })

type DemoClient = readonly [string, string, string, string, string, string, string, string, string, string, string, 'active' | 'prospect']

async function saveClient(client: pg.PoolClient, values: DemoClient, ownerId: string | null) {
  const [legalName, tradeName, taxId, segment, companySize, city, state, primaryContactName, email, phone, source, status] = values
  const existing = await client.query<{ id: string }>('select id from clients where tax_id=$1 and archived_at is null limit 1', [taxId])
  if (existing.rows[0]) {
    await client.query(
      'update clients set trade_name=$1,segment=$2,company_size=$3,city=$4,state=$5,primary_contact_name=$6,email=$7,phone=$8,source=$9,status=$10,updated_at=now() where id=$11',
      [tradeName, segment, companySize, city, state, primaryContactName, email, phone, source, status, existing.rows[0].id],
    )
    return existing.rows[0].id
  }
  const created = await client.query<{ id: string }>(
    `insert into clients(type,legal_name,trade_name,tax_id,segment,company_size,city,state,primary_contact_name,email,phone,source,notes,status,owner_user_id,created_by)
     values('company',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Dados demonstrativos para avaliacao visual.',$12,$13,$13) returning id`,
    [legalName, tradeName, taxId, segment, companySize, city, state, primaryContactName, email, phone, source, status, ownerId],
  )
  return created.rows[0].id
}

async function saveProduct(client: pg.PoolClient, values: readonly [string, string, string, string, string, number, number, string, string, string, 'active' | 'draft'], ownerId: string | null) {
  const [code, name, area, description, objective, duration, hours, profile, assumptions, exclusions, status] = values
  const existing = await client.query<{ id: string }>('select id from consulting_products where code=$1 limit 1', [code])
  if (existing.rows[0]) return existing.rows[0].id
  const created = await client.query<{ id: string }>(
    `insert into consulting_products(code,name,area,description,objective,default_duration_days,estimated_hours,team_profile,assumptions,exclusions,status,created_by)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
    [code, name, area, description, objective, duration, hours, profile, assumptions, exclusions, status, ownerId],
  )
  await client.query(
    `insert into product_template_versions(product_id,version,acceptance_criteria,checklist,indicators,created_by)
     values($1,1,'Validacao do responsavel do cliente.','["Reuniao inicial realizada","Plano aprovado"]'::jsonb,'["Satisfacao do cliente","Acoes priorizadas"]'::jsonb,$2)`,
    [created.rows[0].id, ownerId],
  )
  return created.rows[0].id
}

async function main() {
  const client = await pool.connect()
  try {
    const columns = await client.query<{ column_name: string }>("select column_name from information_schema.columns where table_schema='public' and table_name='clients'")
    const existing = new Set(columns.rows.map(row => row.column_name))
    const required = ['segment', 'company_size', 'city', 'state', 'source', 'primary_contact_name']
    const missing = required.filter(column => !existing.has(column))
    if (missing.length) throw new Error(`Migration operacional pendente. Colunas ausentes: ${missing.join(', ')}`)

    await client.query('begin')
    const user = await client.query<{ id: string }>("select id from users where status='active' and deactivated_at is null order by created_at limit 1")
    const ownerId = user.rows[0]?.id ?? null
    const clients: DemoClient[] = [
      ['DEMO - Horizonte Logistica Ltda.', 'Horizonte Logistica', '12.345.678/0001-10', 'Logistica', 'Medio porte', 'Campinas', 'SP', 'Marina Costa', 'marina@horizonte.demo', '(19) 99999-1001', 'Indicacao', 'active'],
      ['DEMO - Aurora Saude Integrada Ltda.', 'Aurora Saude', '12.345.678/0001-11', 'Saude', 'Grande porte', 'Sao Paulo', 'SP', 'Rafael Mendes', 'rafael@aurora.demo', '(11) 99999-1002', 'Evento', 'prospect'],
      ['DEMO - Atlas Tecnologia S.A.', 'Atlas Tecnologia', '12.345.678/0001-12', 'Tecnologia', 'Pequeno porte', 'Curitiba', 'PR', 'Camila Rocha', 'camila@atlas.demo', '(41) 99999-1003', 'Site', 'active'],
    ]
    // A PostgreSQL client processes one statement at a time. Keeping these
    // writes sequential also avoids warnings and makes the seed deterministic.
    const clientIds: string[] = []
    for (const sample of clients) clientIds.push(await saveClient(client, sample, ownerId))

    const contacts = [
      [clientIds[0], 'Marina Costa', 'Diretora de Operacoes', 'Operacoes', 'marina@horizonte.demo', '(19) 99999-1001', true],
      [clientIds[0], 'Bruno Alves', 'Gerente Financeiro', 'Financeiro', 'bruno@horizonte.demo', '(19) 99999-1011', false],
      [clientIds[1], 'Rafael Mendes', 'Diretor Executivo', 'Diretoria', 'rafael@aurora.demo', '(11) 99999-1002', true],
      [clientIds[2], 'Camila Rocha', 'CEO', 'Diretoria', 'camila@atlas.demo', '(41) 99999-1003', true],
    ] as const
    for (const [clientId, name, jobTitle, area, email, phone, isPrimary] of contacts) {
      await client.query(`insert into contacts(client_id,name,job_title,area,email,phone,is_primary,notes,created_by) select $1,$2,$3,$4,$5,$6,$7,'Contato demonstrativo.',$8 where not exists (select 1 from contacts where client_id=$1 and email=$5 and archived_at is null)`, [clientId, name, jobTitle, area, email, phone, isPrimary, ownerId])
    }

    await saveProduct(client, ['DEMO-DIAG-360', 'Diagnostico 360', 'Estratégia', 'Diagnostico demonstrativo de processos, gestao e prioridades para empresas em crescimento.', 'Identificar prioridades e estruturar um plano de acao objetivo.', 30, 48, 'Consultor de estrategia', 'Acesso a liderancas e documentos de gestao.', 'Nao inclui implantacao.', 'active'], ownerId)
    await saveProduct(client, ['DEMO-PROC-LEAN', 'Processos Lean', 'Processos', 'Mapeamento e redesenho demonstrativo de processos operacionais criticos.', 'Reduzir gargalos e melhorar previsibilidade operacional.', 45, 72, 'Consultor de processos', 'Time disponivel para workshops.', 'Nao inclui desenvolvimento de sistemas.', 'draft'], ownerId)

    await client.query('commit')
    console.log('Dados demonstrativos inseridos/atualizados: 3 clientes, 4 contatos e 2 produtos.')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
