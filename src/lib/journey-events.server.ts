import '@tanstack/react-start/server-only'
import { timingSafeEqual } from 'node:crypto'
import type { PoolClient } from 'pg'
import { z } from 'zod'
import { transaction } from './db.server'

const eventId=z.uuid()
const occurredAt=z.string().datetime({offset:true})
const journey=z.object({id:z.string().min(1).max(200)})
const base=z.object({event_id:eventId,occurred_at:occurredAt})
const identified=z.object({
  company:z.string().trim().min(2).max(200),
  name:z.string().trim().min(2).max(160),
  email:z.string().trim().toLowerCase().pipe(z.email()),
  phone:z.string().trim().min(2).max(40),
  document:z.string().trim().max(30).optional(),
  city:z.string().trim().max(120).optional(),
  state:z.string().trim().regex(/^[A-Za-z]{2}$/).transform(value=>value.toUpperCase()).optional(),
}).strict()
const schema=z.discriminatedUnion('event_type',[
  base.extend({event_type:z.literal('journey.created'),journey:journey.extend({expires_at:z.string().datetime({offset:true}).nullable().optional()})}),
  base.extend({event_type:z.literal('journey.shared'),journey}),
  base.extend({event_type:z.literal('journey.started'),journey}),
  base.extend({event_type:z.literal('journey.identified'),journey,identification:identified}),
  base.extend({event_type:z.literal('journey.progress'),journey:journey.extend({progress:z.number().int().min(0).max(100)})}),
  base.extend({event_type:z.literal('journey.completed'),journey:journey.extend({progress:z.literal(100)}),diagnostic:z.object({summary:z.record(z.string(),z.unknown()),result_reference:z.string().min(1).max(1000)})}),
  base.extend({event_type:z.literal('journey.revoked'),journey}),
  base.extend({event_type:z.literal('journey.expired'),journey}),
])

export type JourneyEvent=z.infer<typeof schema>
type JourneyEventType=JourneyEvent['event_type']
type JourneyStatus='generated'|'shared'|'started'|'identified'|'in_progress'|'completed'|'revoked'|'expired'|'failed'
type Instance={id:string;opportunity_id:string;external_journey_id:string;status:JourneyStatus;progress:number|null;last_event_at:string|null}
const cols='id,opportunity_id,external_journey_id,status,progress,last_event_at::text'
const sequence:JourneyStatus[]=['generated','shared','started','identified','in_progress','completed']
const targets:Partial<Record<JourneyEventType,JourneyStatus>>={
  'journey.shared':'shared','journey.started':'started','journey.identified':'identified','journey.progress':'in_progress','journey.completed':'completed','journey.revoked':'revoked','journey.expired':'expired',
}

export function isValidJourneyEventsSecret(value:string|null){const secret=process.env.JOURNEY_EVENTS_SECRET;if(!secret||!value)return false;const a=Buffer.from(secret),b=Buffer.from(value);return a.length===b.length&&timingSafeEqual(a,b)}
export function parseJourneyEvent(value:unknown){return schema.safeParse(value)}

export function journeyTransition(status:JourneyStatus,eventType:JourneyEventType):JourneyStatus|null{
  if(eventType==='journey.created'||['completed','revoked','expired','failed'].includes(status))return null
  const target=targets[eventType]
  if(!target)return null
  if(target==='revoked'||target==='expired')return target
  if(eventType==='journey.progress'&&status==='in_progress')return 'in_progress'
  const currentRank=sequence.indexOf(status),targetRank=sequence.indexOf(target)
  return currentRank>=0&&targetRank>currentRank?target:null
}

export function journeyEventPlan(status:JourneyStatus,eventType:JourneyEventType,stale:boolean){
  const nextStatus=stale?null:journeyTransition(status,eventType)
  if(eventType==='journey.identified')return{applyEffects:true,nextStatus}
  return{applyEffects:nextStatus!==null,nextStatus}
}

const reply=(instance:Instance,idempotent:boolean)=>({ok:true,opportunity_id:instance.opportunity_id,journey_instance_id:instance.id,external_journey_id:instance.external_journey_id,status:instance.status,idempotent})
const audit=async(client:PoolClient,opportunityId:string,action:string,event:JourneyEvent,extra={})=>client.query('insert into audit_logs(entity_type,entity_id,action,metadata) values($1,$2,$3,$4::jsonb)',['commercial_opportunity',opportunityId,action,JSON.stringify({event_id:event.event_id,event_type:event.event_type,external_journey_id:event.journey.id,occurred_at:event.occurred_at,...extra})])
const receipt=async(client:PoolClient,event:JourneyEvent)=>(await client.query<{id:string}>('insert into journey_event_receipts(event_id,external_journey_id,event_type,occurred_at) values($1,$2,$3,$4) on conflict(event_id) do nothing returning id',[event.event_id,event.journey.id,event.event_type,new Date(event.occurred_at)])).rows[0]
const update=async(client:PoolClient,instance:Instance,status:JourneyStatus,event:JourneyEvent,fields:Record<string,unknown>={})=>{const sets=['status=$1','last_event_at=$2','updated_at=now()'],values:unknown[]=[status,new Date(event.occurred_at)];for(const[key,value]of Object.entries(fields)){sets.push(`${key}=$${values.length+1}${key==='diagnostic_summary'?'::jsonb':''}`);values.push(key==='diagnostic_summary'?JSON.stringify(value):value)}values.push(instance.id);return(await client.query<Instance>(`update journey_instances set ${sets.join(',')} where id=$${values.length} returning ${cols}`,values)).rows[0]}

const stageRank=(status:string)=>['entrada','qualificacao','diagnostico','proposta','negociacao','ganho'].indexOf(status)
async function move(client:PoolClient,id:string,target:'qualificacao'|'diagnostico',event:JourneyEvent){const opportunity=(await client.query<{id:string;stage:string}>('select id,stage from commercial_opportunities where id=$1 for update',[id])).rows[0];if(!opportunity||stageRank(opportunity.stage)>=stageRank(target))return;await client.query('update commercial_opportunities set stage=$1,updated_at=now() where id=$2',[target,id]);await client.query('insert into audit_logs(entity_type,entity_id,action,old_values,new_values,metadata) values($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb)',['commercial_opportunity',id,'stage_changed',JSON.stringify({stage:opportunity.stage}),JSON.stringify({stage:target}),JSON.stringify({event_id:event.event_id,source:'journey'})])}

async function identify(client:PoolClient,instance:Instance,event:Extract<JourneyEvent,{event_type:'journey.identified'}>,transitionStatus:boolean){const data=event.identification,digits=(data.document??'').replace(/\D/g,'');let customer:{id:string}|undefined,contact:{id:string;client_id:string}|undefined;if(digits.length===11||digits.length===14){const rows=(await client.query<{id:string}>("select id from clients where archived_at is null and regexp_replace(coalesce(tax_id,''),'[^0-9]','','g')=$1 for update",[digits])).rows;if(rows.length===1)customer=rows[0]}if(!customer){const rows=(await client.query<{id:string;client_id:string}>('select id,client_id from contacts where archived_at is null and email=$1 for update',[data.email])).rows;if(rows.length===1){contact=rows[0];customer={id:contact.client_id}}}if(!customer)customer=(await client.query<{id:string}>("insert into clients(legal_name,type,tax_id,email,phone,city,state,primary_contact_name,source,status,created_by) values($1,'company',$2,$3,$4,$5,$6,$7,'Jornada','prospect',null) returning id",[data.company,data.document||null,data.email,data.phone,data.city||null,data.state||null,data.name])).rows[0];if(!contact){const rows=(await client.query<{id:string;client_id:string}>('select id,client_id from contacts where client_id=$1 and archived_at is null and email=$2 for update',[customer.id,data.email])).rows;if(rows.length===1)contact=rows[0]}if(!contact)contact=(await client.query<{id:string;client_id:string}>('insert into contacts(client_id,name,email,phone,is_primary,created_by) values($1,$2,$3,$4,false,null) returning id,client_id',[customer.id,data.name,data.email,data.phone])).rows[0];await client.query('update commercial_opportunities set company=$1,contact=$2,email=$3,phone=$4,client_id=$5,contact_id=$6,updated_at=now() where id=$7',[data.company,data.name,data.email,data.phone,customer.id,contact.id,instance.opportunity_id]);const next=transitionStatus?await update(client,instance,'identified',event,{identified_at:new Date(event.occurred_at)}):(await client.query<Instance>(`update journey_instances set identified_at=coalesce(identified_at,$1),updated_at=now() where id=$2 returning ${cols}`,[new Date(event.occurred_at),instance.id])).rows[0];await move(client,instance.opportunity_id,'qualificacao',event);return next}

async function processCreated(event:Extract<JourneyEvent,{event_type:'journey.created'}>){return transaction(async client=>{
  await client.query('select pg_advisory_xact_lock(hashtextextended($1,0))',[event.journey.id])
  const existing=(await client.query<Instance>(`select ${cols} from journey_instances where external_journey_id=$1`,[event.journey.id])).rows[0]
  if(existing)return reply(existing,true)
  if(!(await receipt(client,event)))throw Error('EVENT_ID_CONFLICT')
  const opportunity=(await client.query<{id:string}>("insert into commercial_opportunities(company,contact,area,stage,estimated_value,owner_name,created_by) values($1,$2,$3,'entrada',0,$4,null) returning id",['Aguardando identificação','Jornada do Empreendedor','Estratégia','Integração Jornada'])).rows[0]
  const instance=(await client.query<Instance>(`insert into journey_instances(external_journey_id,opportunity_id,status,expires_at,last_event_at) values($1,$2,'generated',$3,$4) returning ${cols}`,[event.journey.id,opportunity.id,event.journey.expires_at?new Date(event.journey.expires_at):null,new Date(event.occurred_at)])).rows[0]
  await audit(client,instance.opportunity_id,'created_from_journey',event,{stage:'entrada'})
  return reply(instance,false)
})}

export async function processJourneyEvent(event:JourneyEvent){
  if(event.event_type==='journey.created')return processCreated(event)
  return transaction(async client=>{
    const instance=(await client.query<Instance>(`select ${cols} from journey_instances where external_journey_id=$1 for update`,[event.journey.id])).rows[0]
    if(!instance)throw Error('JOURNEY_NOT_FOUND')
    if(!(await receipt(client,event)))return reply(instance,true)
    const stale=!!instance.last_event_at&&new Date(event.occurred_at)<new Date(instance.last_event_at)
    const plan=journeyEventPlan(instance.status,event.event_type,stale)
    let next=instance
    if(plan.applyEffects){
      if(event.event_type==='journey.identified')next=await identify(client,instance,event,plan.nextStatus==='identified')
      else if(event.event_type==='journey.progress'&&plan.nextStatus)next=await update(client,instance,plan.nextStatus,event,{progress:Math.max(instance.progress??0,event.journey.progress)})
      else if(event.event_type==='journey.completed'&&plan.nextStatus){next=await update(client,instance,plan.nextStatus,event,{progress:100,completed_at:new Date(event.occurred_at),diagnostic_summary:event.diagnostic.summary,result_reference:event.diagnostic.result_reference});await move(client,instance.opportunity_id,'diagnostico',event)}
      else if(plan.nextStatus)next=await update(client,instance,plan.nextStatus,event,event.event_type==='journey.started'?{started_at:new Date(event.occurred_at)}:{})
    }
    await audit(client,instance.opportunity_id,plan.applyEffects?event.event_type.replace('.','_'):'journey_event_ignored',event,{applied:plan.applyEffects,status_changed:plan.nextStatus!==null})
    return reply(next,false)
  })
}
