import { createServerFn } from '@tanstack/react-start'
import type { PoolClient } from 'pg'
import { z } from 'zod'
import { requirePermission } from './auth.server'
import { query, transaction } from './db.server'
import type { AdminUser, ClientRecord, ContactRecord, ProductRecord, RoleRecord, TemplateActivity, TemplateDeliverable, TemplatePhase, TemplateVersion, UserSummary } from './domain.types'
import { activitySchema, clientSchema, contactSchema, deliverableSchema, idSchema, phaseSchema, productSchema, templateItemDeleteSchema, userCreateSchema, userUpdateSchema } from './crm.schemas'
import { hashPassword } from './password.server'

type JsonObject = Record<string, unknown>
const clientInput = clientSchema.extend({ id: z.uuid().optional() })
const contactInput = contactSchema.extend({ id: z.uuid().optional() })
const productInput = productSchema.extend({ id: z.uuid().optional() })

async function audit(client: PoolClient, actor: string, entityType: string, entityId: string, action: string, oldValue: JsonObject | null, newValue: JsonObject | null) {
  await client.query('insert into audit_logs(actor_user_id,entity_type,entity_id,action,old_values,new_values) values($1,$2,$3,$4,$5::jsonb,$6::jsonb)', [actor, entityType, entityId, action, JSON.stringify(oldValue), JSON.stringify(newValue)])
}
async function editableTemplate(client: PoolClient, productId: string) {
  const result = await client.query<{ id:string; status:string }>('select id,status from product_template_versions where product_id=$1 order by version desc limit 1 for update', [productId])
  const template = result.rows[0]
  if (!template) throw new Error('TEMPLATE_NOT_FOUND')
  if (template.status !== 'draft') throw new Error('TEMPLATE_IMMUTABLE')
  return template
}

export const dashboardData = createServerFn({ method:'GET' }).handler(async () => {
  await requirePermission('crm.read')
  return (await query<{clients:number;products:number;users:number;contacts:number}>(`select (select count(*) from clients where status='active' and archived_at is null)::int clients,(select count(*) from consulting_products where archived_at is null)::int products,(select count(*) from users where status='active' and deactivated_at is null)::int users,(select count(*) from contacts where archived_at is null)::int contacts`)).rows[0]
})
export const listClients = createServerFn({ method:'GET' }).handler(async () => {
  await requirePermission('crm.read')
  return (await query<ClientRecord>(`select c.*,u.name owner_name,(select count(*) from contacts x where x.client_id=c.id and x.archived_at is null)::int contacts_count from clients c left join users u on u.id=c.owner_user_id where c.archived_at is null order by c.created_at desc`)).rows
})
export const listActiveUsers = createServerFn({ method:'GET' }).handler(async () => { await requirePermission('crm.read'); return (await query<UserSummary>("select id,name from users where status='active' and deactivated_at is null order by name")).rows })
export const getClient = createServerFn({ method:'GET' }).validator(idSchema).handler(async ({ data }) => {
  await requirePermission('crm.read')
  const [clients,contacts,users] = await Promise.all([query<ClientRecord>('select * from clients where id=$1 and archived_at is null',[data.id]),query<ContactRecord>('select * from contacts where client_id=$1 and archived_at is null order by is_primary desc,name',[data.id]),query<UserSummary>("select id,name from users where status='active' and deactivated_at is null order by name")])
  if (!clients.rows[0]) throw new Error('NOT_FOUND')
  return { client:clients.rows[0], contacts:contacts.rows, users:users.rows }
})
export const saveClient = createServerFn({ method:'POST' }).validator(clientInput).handler(async ({ data }) => {
  const actor=await requirePermission('crm.write')
  return transaction(async client => {
    const values=[data.legalName,data.tradeName||null,data.type,data.taxId||null,data.segment||null,data.companySize||null,data.city||null,data.state?.toUpperCase()||null,data.primaryContactName||null,data.email||null,data.phone||null,data.source||null,data.notes||null,data.status,data.ownerUserId||null]
    let id=data.id
    if (id) {
      const old=(await client.query<ClientRecord>('select * from clients where id=$1 and archived_at is null for update',[id])).rows[0]
      if(!old) throw new Error('NOT_FOUND')
      await client.query('update clients set legal_name=$1,trade_name=$2,type=$3,tax_id=$4,segment=$5,company_size=$6,city=$7,state=$8,primary_contact_name=$9,email=$10,phone=$11,source=$12,notes=$13,status=$14,owner_user_id=$15,updated_at=now() where id=$16',[...values,id])
      await audit(client,actor.id,'client',id,'updated',{legal_name:old.legal_name,status:old.status},{legal_name:data.legalName,status:data.status})
    } else {
      const created=await client.query<{id:string}>('insert into clients(legal_name,trade_name,type,tax_id,segment,company_size,city,state,primary_contact_name,email,phone,source,notes,status,owner_user_id,created_by)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)returning id',[...values,actor.id])
      id=created.rows[0].id; await audit(client,actor.id,'client',id,'created',null,{legal_name:data.legalName,status:data.status})
    }
    return { id }
  })
})
export const archiveClient = createServerFn({ method:'POST' }).validator(idSchema).handler(async ({ data }) => {
  const actor=await requirePermission('crm.write')
  await transaction(async client => { const old=(await client.query<ClientRecord>('select * from clients where id=$1 and archived_at is null for update',[data.id])).rows[0]; if(!old)throw new Error('NOT_FOUND'); await client.query("update clients set archived_at=now(),status='inactive',updated_at=now() where id=$1",[data.id]); await audit(client,actor.id,'client',data.id,'archived',{status:old.status},{status:'inactive'}) })
  return { ok:true }
})
export const saveContact = createServerFn({ method:'POST' }).validator(contactInput).handler(async ({ data }) => {
  const actor=await requirePermission('crm.write')
  return transaction(async client => { if(data.isPrimary)await client.query('update contacts set is_primary=false,updated_at=now() where client_id=$1 and archived_at is null',[data.clientId]); let id=data.id; if(id){const old=(await client.query<ContactRecord>('select * from contacts where id=$1 and client_id=$2 and archived_at is null for update',[id,data.clientId])).rows[0];if(!old)throw new Error('NOT_FOUND');await client.query('update contacts set name=$1,job_title=$2,area=$3,email=$4,phone=$5,is_primary=$6,notes=$7,updated_at=now() where id=$8',[data.name,data.jobTitle||null,data.area||null,data.email||null,data.phone||null,data.isPrimary,data.notes||null,id]);await audit(client,actor.id,'contact',id,'updated',{name:old.name},{name:data.name})}else{const created=await client.query<{id:string}>('insert into contacts(client_id,name,job_title,area,email,phone,is_primary,notes,created_by)values($1,$2,$3,$4,$5,$6,$7,$8,$9)returning id',[data.clientId,data.name,data.jobTitle||null,data.area||null,data.email||null,data.phone||null,data.isPrimary,data.notes||null,actor.id]);id=created.rows[0].id;await audit(client,actor.id,'contact',id,'created',null,{name:data.name,client_id:data.clientId})}return{id} })
})
export const archiveContact = createServerFn({ method:'POST' }).validator(idSchema).handler(async ({ data }) => { const actor=await requirePermission('crm.write'); await transaction(async client=>{const old=(await client.query<ContactRecord>('select * from contacts where id=$1 and archived_at is null for update',[data.id])).rows[0];if(!old)throw new Error('NOT_FOUND');await client.query('update contacts set archived_at=now(),updated_at=now() where id=$1',[data.id]);await audit(client,actor.id,'contact',data.id,'archived',{name:old.name},null)});return{ok:true} })

export const listProducts = createServerFn({ method:'GET' }).handler(async () => { await requirePermission('catalog.read'); return (await query<ProductRecord>(`select p.*,(select count(*) from product_template_phases ph join product_template_versions v on v.id=ph.template_version_id where v.product_id=p.id and v.version=(select max(version) from product_template_versions where product_id=p.id))::int phases_count from consulting_products p where p.archived_at is null order by p.created_at desc`)).rows })
export const getProduct = createServerFn({ method:'GET' }).validator(idSchema).handler(async ({ data }) => {
  await requirePermission('catalog.read')
  const [productResult, templateResult] = await Promise.all([
    query<ProductRecord>('select * from consulting_products where id=$1 and archived_at is null',[data.id]),
    query<TemplateVersion>('select * from product_template_versions where product_id=$1 order by version desc limit 1',[data.id]),
  ])
  const product = productResult.rows[0]
  if (!product) throw new Error('NOT_FOUND')
  const template = templateResult.rows[0]
  if (!template) throw new Error('TEMPLATE_NOT_FOUND')
  const phases = (await query<Omit<TemplatePhase,'activities'|'deliverables'>>('select * from product_template_phases where template_version_id=$1 order by sequence',[template.id])).rows
  if (!phases.length) return { product, template, phases: [] as TemplatePhase[] }
  const phaseIds = phases.map((phase) => phase.id)
  const [activities, deliverables] = await Promise.all([
    query<TemplateActivity>('select * from product_template_activities where phase_id = any($1::uuid[]) order by phase_id,sequence',[phaseIds]),
    query<TemplateDeliverable>('select * from product_template_deliverables where phase_id = any($1::uuid[]) order by phase_id,sequence',[phaseIds]),
  ])
  const complete = phases.map((phase) => ({
    ...phase,
    activities: activities.rows.filter((item) => item.phase_id === phase.id),
    deliverables: deliverables.rows.filter((item) => item.phase_id === phase.id),
  }))
  return { product, template, phases: complete }
})
export const saveProduct = createServerFn({ method:'POST' }).validator(productInput).handler(async ({ data }) => {
  const actor=await requirePermission('catalog.write'); return transaction(async client=>{let id=data.id;if(id){const old=(await client.query<ProductRecord>('select * from consulting_products where id=$1 and archived_at is null for update',[id])).rows[0];if(!old)throw new Error('NOT_FOUND');await client.query('update consulting_products set code=$1,name=$2,area=$3,description=$4,objective=$5,default_duration_days=$6,estimated_hours=$7,team_profile=$8,assumptions=$9,exclusions=$10,status=$11,updated_at=now() where id=$12',[data.code,data.name,data.area,data.description,data.objective,data.defaultDurationDays??null,data.estimatedHours??null,data.teamProfile||null,data.assumptions||null,data.exclusions||null,data.status,id]);const template=await editableTemplate(client,id);await client.query('update product_template_versions set acceptance_criteria=$1,checklist=$2::jsonb,indicators=$3::jsonb where id=$4',[data.acceptanceCriteria||null,JSON.stringify(data.checklist),JSON.stringify(data.indicators),template.id]);await audit(client,actor.id,'consulting_product',id,'updated',{name:old.name,status:old.status},{name:data.name,status:data.status})}else{const created=await client.query<{id:string}>('insert into consulting_products(code,name,area,description,objective,default_duration_days,estimated_hours,team_profile,assumptions,exclusions,status,created_by)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)returning id',[data.code,data.name,data.area,data.description,data.objective,data.defaultDurationDays??null,data.estimatedHours??null,data.teamProfile||null,data.assumptions||null,data.exclusions||null,data.status,actor.id]);id=created.rows[0].id;await client.query('insert into product_template_versions(product_id,version,acceptance_criteria,checklist,indicators,created_by)values($1,1,$2,$3::jsonb,$4::jsonb,$5)',[id,data.acceptanceCriteria||null,JSON.stringify(data.checklist),JSON.stringify(data.indicators),actor.id]);await audit(client,actor.id,'consulting_product',id,'created',null,{name:data.name,status:data.status})}return{id}})
})
export const archiveProduct=createServerFn({method:'POST'}).validator(idSchema).handler(async({data})=>{const actor=await requirePermission('catalog.write');await transaction(async client=>{const old=(await client.query<ProductRecord>('select * from consulting_products where id=$1 and archived_at is null for update',[data.id])).rows[0];if(!old)throw new Error('NOT_FOUND');await client.query("update consulting_products set archived_at=now(),status='inactive',updated_at=now() where id=$1",[data.id]);await audit(client,actor.id,'consulting_product',data.id,'archived',{status:old.status},{status:'inactive'})});return{ok:true}})

export const saveTemplatePhase=createServerFn({method:'POST'}).validator(phaseSchema).handler(async({data})=>{const actor=await requirePermission('catalog.write');return transaction(async client=>{const template=await editableTemplate(client,data.productId);let id=data.id;if(id){await client.query('update product_template_phases set name=$1,description=$2,sequence=$3,estimated_hours=$4,estimated_duration_days=$5 where id=$6 and template_version_id=$7',[data.name,data.description||null,data.sequence,data.estimatedHours??null,data.estimatedDurationDays??null,id,template.id]);await audit(client,actor.id,'product_template_phase',id,'updated',null,{name:data.name})}else{const created=await client.query<{id:string}>('insert into product_template_phases(template_version_id,name,description,sequence,estimated_hours,estimated_duration_days)values($1,$2,$3,$4,$5,$6)returning id',[template.id,data.name,data.description||null,data.sequence,data.estimatedHours??null,data.estimatedDurationDays??null]);id=created.rows[0].id;await audit(client,actor.id,'product_template_phase',id,'created',null,{name:data.name})}return{id}})})
export const saveTemplateActivity=createServerFn({method:'POST'}).validator(activitySchema).handler(async({data})=>{const actor=await requirePermission('catalog.write');return transaction(async client=>{await editableTemplate(client,data.productId);let id=data.id;if(id){await client.query('update product_template_activities set name=$1,description=$2,sequence=$3,estimated_hours=$4,estimated_duration_days=$5,responsible_profile=$6 where id=$7 and phase_id=$8',[data.name,data.description||null,data.sequence,data.estimatedHours??null,data.estimatedDurationDays??null,data.responsibleProfile||null,id,data.phaseId]);await audit(client,actor.id,'product_template_activity',id,'updated',null,{name:data.name})}else{const created=await client.query<{id:string}>('insert into product_template_activities(phase_id,name,description,sequence,estimated_hours,estimated_duration_days,responsible_profile)values($1,$2,$3,$4,$5,$6,$7)returning id',[data.phaseId,data.name,data.description||null,data.sequence,data.estimatedHours??null,data.estimatedDurationDays??null,data.responsibleProfile||null]);id=created.rows[0].id;await audit(client,actor.id,'product_template_activity',id,'created',null,{name:data.name})}return{id}})})
export const saveTemplateDeliverable=createServerFn({method:'POST'}).validator(deliverableSchema).handler(async({data})=>{const actor=await requirePermission('catalog.write');return transaction(async client=>{await editableTemplate(client,data.productId);let id=data.id;if(id){await client.query('update product_template_deliverables set name=$1,description=$2,acceptance_criteria=$3,sequence=$4 where id=$5 and phase_id=$6',[data.name,data.description||null,data.acceptanceCriteria,data.sequence,id,data.phaseId]);await audit(client,actor.id,'product_template_deliverable',id,'updated',null,{name:data.name})}else{const created=await client.query<{id:string}>('insert into product_template_deliverables(phase_id,name,description,acceptance_criteria,sequence)values($1,$2,$3,$4,$5)returning id',[data.phaseId,data.name,data.description||null,data.acceptanceCriteria,data.sequence]);id=created.rows[0].id;await audit(client,actor.id,'product_template_deliverable',id,'created',null,{name:data.name})}return{id}})})
export const deleteTemplateItem=createServerFn({method:'POST'}).validator(templateItemDeleteSchema).handler(async({data})=>{const actor=await requirePermission('catalog.write');await transaction(async client=>{await editableTemplate(client,data.productId);const table={phase:'product_template_phases',activity:'product_template_activities',deliverable:'product_template_deliverables'}[data.kind];await client.query(`delete from ${table} where id=$1`,[data.id]);await audit(client,actor.id,`product_template_${data.kind}`,data.id,'deleted',null,null)});return{ok:true}})

export const adminData=createServerFn({method:'GET'}).handler(async()=>{await requirePermission('admin.manage');const[users,roles]=await Promise.all([query<AdminUser>(`select u.id,u.name,u.email::text,u.status,coalesce(array_agg(r.id)filter(where r.id is not null),'{}') role_ids,coalesce(array_agg(r.name)filter(where r.name is not null),'{}') role_names from users u left join user_roles ur on ur.user_id=u.id left join roles r on r.id=ur.role_id where u.deactivated_at is null group by u.id order by u.name`),query<RoleRecord>(`select r.id,r.code,r.name,r.description,r.is_system,coalesce(array_agg(p.code order by p.code)filter(where p.code is not null),'{}') permission_codes from roles r left join role_permissions rp on rp.role_id=r.id left join permissions p on p.id=rp.permission_id group by r.id order by r.name`)]);return{users:users.rows,roles:roles.rows}})
export const createUser=createServerFn({method:'POST'}).validator(userCreateSchema).handler(async({data})=>{const actor=await requirePermission('admin.manage');const passwordHash=await hashPassword(data.password);return transaction(async client=>{const existing=await client.query('select 1 from users where email=$1',[data.email]);if(existing.rowCount)throw new Error('EMAIL_ALREADY_EXISTS');const created=await client.query<{id:string}>("insert into users(name,email,password_hash,status)values($1,$2,$3,'active')returning id",[data.name,data.email,passwordHash]);await client.query('insert into user_roles(user_id,role_id,granted_by)values($1,$2,$3)',[created.rows[0].id,data.roleId,actor.id]);await audit(client,actor.id,'user',created.rows[0].id,'created',null,{name:data.name,email:data.email,role_id:data.roleId});return{id:created.rows[0].id}})})
export const updateUserRole=createServerFn({method:'POST'}).validator(userUpdateSchema).handler(async({data})=>{const actor=await requirePermission('admin.manage');if(actor.id===data.id&&data.status==='inactive')throw new Error('CANNOT_DEACTIVATE_SELF');await transaction(async client=>{const old=(await client.query<{status:string}>('select status from users where id=$1 for update',[data.id])).rows[0];if(!old)throw new Error('NOT_FOUND');await client.query('update users set status=$1,updated_at=now() where id=$2',[data.status,data.id]);await client.query('delete from user_roles where user_id=$1',[data.id]);await client.query('insert into user_roles(user_id,role_id,granted_by)values($1,$2,$3)',[data.id,data.roleId,actor.id]);await audit(client,actor.id,'user',data.id,'updated',{status:old.status},{status:data.status,role_id:data.roleId})});return{ok:true}})
