import { createServerFn } from '@tanstack/react-start'
import { query, transaction } from './db.server'
import { requirePermission } from './auth.server'
import { clientSchema, contactSchema, productSchema } from './crm.schemas'

export const getFoundationData = createServerFn({ method: 'GET' }).handler(async () => {
  await requirePermission('crm.read')
  const [clients, contacts, products] = await Promise.all([
    query<{ id: string; legal_name: string; trade_name: string | null; type: string; status: string }>(
      `select id, legal_name, trade_name, type, status from clients where archived_at is null order by created_at desc limit 100`,
    ),
    query<{ id: string; name: string; client_name: string; email: string | null; is_primary: boolean }>(
      `select ct.id, ct.name, c.legal_name as client_name, ct.email::text, ct.is_primary
       from contacts ct join clients c on c.id = ct.client_id
       where ct.archived_at is null order by ct.created_at desc limit 100`,
    ),
    query<{ id: string; code: string; name: string; area: string; status: string; estimated_hours: string | null }>(
      `select id, code, name, area, status, estimated_hours::text from consulting_products
       where archived_at is null order by created_at desc limit 100`,
    ),
  ])
  return { clients: clients.rows, contacts: contacts.rows, products: products.rows }
})

export const createClient = createServerFn({ method: 'POST' }).validator(clientSchema).handler(async ({ data }) => {
  const user = await requirePermission('crm.write')
  return transaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into clients (legal_name, trade_name, type, tax_id, email, phone, status, owner_user_id, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$8) returning id`,
      [data.legalName, data.tradeName || null, data.type, data.taxId || null, data.email || null, data.phone || null, data.status, user.id],
    )
    await client.query(
      `insert into audit_logs (actor_user_id, entity_type, entity_id, action, new_values)
       values ($1, 'client', $2, 'created', jsonb_build_object('legal_name',$3,'status',$4))`,
      [user.id, result.rows[0].id, data.legalName, data.status],
    )
    return result.rows[0]
  })
})

export const createContact = createServerFn({ method: 'POST' }).validator(contactSchema).handler(async ({ data }) => {
  const user = await requirePermission('crm.write')
  return transaction(async (client) => {
    if (data.isPrimary) await client.query('update contacts set is_primary = false, updated_at = now() where client_id = $1 and is_primary', [data.clientId])
    const result = await client.query<{ id: string }>(
      `insert into contacts (client_id,name,job_title,email,phone,is_primary,created_by)
       values ($1,$2,$3,$4,$5,$6,$7) returning id`,
      [data.clientId, data.name, data.jobTitle || null, data.email || null, data.phone || null, data.isPrimary, user.id],
    )
    await client.query(`insert into audit_logs (actor_user_id,entity_type,entity_id,action,new_values) values ($1,'contact',$2,'created',jsonb_build_object('name',$3))`, [user.id, result.rows[0].id, data.name])
    return result.rows[0]
  })
})

export const createProduct = createServerFn({ method: 'POST' }).validator(productSchema).handler(async ({ data }) => {
  const user = await requirePermission('catalog.write')
  return transaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into consulting_products (code,name,area,description,objective,default_duration_days,estimated_hours,created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [data.code, data.name, data.area, data.description, data.objective, data.defaultDurationDays ?? null, data.estimatedHours ?? null, user.id],
    )
    await client.query('insert into product_template_versions (product_id,version,created_by) values ($1,1,$2)', [result.rows[0].id, user.id])
    await client.query(`insert into audit_logs (actor_user_id,entity_type,entity_id,action,new_values) values ($1,'consulting_product',$2,'created',jsonb_build_object('code',$3,'name',$4))`, [user.id, result.rows[0].id, data.code, data.name])
    return result.rows[0]
  })
})
