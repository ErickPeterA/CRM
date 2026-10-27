import type { JourneyInstanceRecord, JourneyTimelineEvent } from './domain.types'

type MilestoneType=JourneyTimelineEvent['event_type']
type Milestone={type:MilestoneType;occurredAt:string}

export function timelineMilestones(journey:JourneyInstanceRecord):Milestone[]{
  const received=new Map<MilestoneType,string>()
  for(const event of journey.timeline??[]){if(validDate(event.occurred_at)&&!received.has(event.event_type))received.set(event.event_type,event.occurred_at)}
  const fallback:[MilestoneType,string|null|undefined][]=[
    ['journey.created',journey.created_at],['journey.started',journey.started_at],['journey.identified',journey.identified_at],['journey.completed',journey.completed_at],
  ]
  for(const [type,value] of fallback){if(value&&validDate(value)&&!received.has(type))received.set(type,value)}
  if(journey.status!=='revoked')received.delete('journey.revoked')
  if(journey.status!=='expired')received.delete('journey.expired')
  return [...received].map(([type,occurredAt])=>({type,occurredAt})).sort((a,b)=>new Date(a.occurredAt).getTime()-new Date(b.occurredAt).getTime())
}

function validDate(value:string){return Number.isFinite(new Date(value).getTime())}
