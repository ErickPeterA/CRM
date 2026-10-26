import type { JourneyInstanceRecord } from '../lib/domain.types'
import { JourneyDiagnosticView } from './JourneyDiagnosticView'

const labels:Record<JourneyInstanceRecord['status'],string>={generated:'Link gerado',shared:'Compartilhada',started:'Iniciada',identified:'Identificada',in_progress:'Em andamento',completed:'Concluída',revoked:'Revogada',expired:'Expirada',failed:'Falha'}

export function JourneyCardInfo({journey}:{journey:JourneyInstanceRecord}){
  const progress=journey.status==='completed'?100:journey.progress
  return <div className="mt-3 rounded-lg border border-[#d9e6df] bg-[#f4faf6] p-2.5 text-[8px] text-[#527064]"><div className="flex items-center justify-between gap-2"><strong className="text-[#315d4d]">Jornada do Empreendedor</strong><span>{labels[journey.status]}</span></div>{progress!==null&&progress!==undefined?<><div className="mt-2 flex justify-between"><span>Jornada {progress}%</span><span>{expiry(journey.expires_at)}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#d8e8df]"><i className="block h-full bg-[#4f8d70]" style={{width:`${progress}%`}}/></div></>:<p className="mt-2">{journey.status==='generated'?'Ainda não iniciada':expiry(journey.expires_at)}</p>}</div>
}

export function JourneyDetails({journey}:{journey:JourneyInstanceRecord}){
  return <section className="rounded-[20px] border border-[#cfe1d7] bg-[#f6fbf8] p-4 sm:p-6"><p className="text-[8px] font-extrabold tracking-[1.3px] text-[#608071]">JORNADA DO EMPREENDEDOR</p><h3 className="mt-2 text-base text-[#24463a]">{labels[journey.status]}</h3>{journey.progress!==null&&<div className="mt-4"><div className="mb-1 flex justify-between text-[10px] text-[#527064]"><span>Progresso</span><strong>{journey.status==='completed'?100:journey.progress}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#d8e8df]"><i className="block h-full bg-[#4f8d70]" style={{width:`${journey.status==='completed'?100:journey.progress}%`}}/></div></div>}<div className="mt-5 grid gap-2 text-[10px] text-[#52645c] sm:grid-cols-2"><Meta label="Identificador" value={journey.external_journey_id}/><Meta label="Criada em" value={date(journey.created_at)}/><Meta label="Iniciada em" value={date(journey.started_at)}/><Meta label="Identificada em" value={date(journey.identified_at)}/><Meta label="Concluída em" value={date(journey.completed_at)}/><Meta label="Expiração" value={expiry(journey.expires_at)}/></div>{journey.status==='completed'&&<JourneyDiagnosticView data={journey.diagnostic_summary} resultReference={journey.result_reference}/>}</section>
}

function Meta({label,value}:{label:string;value:string}){return <p><span className="text-[#819087]">{label}: </span><strong>{value}</strong></p>}
function date(value:string|null){return value?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—'}
function expiry(value:string|null){if(!value)return'Sem expiração';const ms=new Date(value).getTime()-Date.now();if(ms<=0)return'Expirada';const h=Math.ceil(ms/3600000),d=Math.floor(h/24);return d?`Expira em ${d}d ${h%24}h`:`Expira em ${h}h`}
