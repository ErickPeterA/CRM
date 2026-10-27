import type { JourneyInstanceRecord, JourneyTimelineEvent } from '../lib/domain.types'
import { timelineMilestones } from '../lib/journey-timeline'

type MilestoneType=JourneyTimelineEvent['event_type']
const labels:Record<MilestoneType,string>={
  'journey.created':'Jornada gerada',
  'journey.started':'Jornada iniciada',
  'journey.identified':'Identificação recebida',
  'journey.completed':'Jornada concluída',
  'journey.revoked':'Jornada revogada',
  'journey.expired':'Jornada expirada',
}

export function JourneyTimeline({journey}:{journey:JourneyInstanceRecord}){
  const milestones=timelineMilestones(journey)
  const showProgress=journey.status==='in_progress'&&journey.progress!==null
  if(!milestones.length&&!showProgress)return null

  return <section className="mt-5 border-t border-[#d9e6df] pt-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[8px] font-extrabold tracking-[1.2px] text-[#6d8479]">ACOMPANHAMENTO</p><h4 className="mt-1 text-sm text-[#294a3e]">Histórico da Jornada</h4></div>{showProgress&&<span className="rounded-full border border-[#cfe1d7] bg-white px-3 py-2 text-[9px] font-bold text-[#3f6857]">Jornada em andamento — {journey.progress}%</span>}</div>
    {!!milestones.length&&<ol className="mt-4 list-none p-0">{milestones.map((item,index)=><li key={item.type} className="relative flex gap-3 pb-4 last:pb-0"><span className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-[#74a58f] bg-[#f6fbf8]"><i className="size-1.5 rounded-full bg-[#4f8d70]"/></span>{index<milestones.length-1&&<span aria-hidden="true" className="absolute top-5 bottom-0 left-[9px] w-px bg-[#cfe0d7]"/>}<div><strong className="block text-[10px] text-[#35594b]">{labels[item.type]}</strong><time dateTime={item.occurredAt} className="mt-1 block text-[9px] text-[#7d8b84]">{formatDate(item.occurredAt)}</time></div></li>)}</ol>}
  </section>
}

function formatDate(value:string){return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)).replace(',',' às')}
