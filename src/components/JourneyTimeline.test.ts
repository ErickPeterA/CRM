import { describe, expect, it } from 'vitest'
import type { JourneyInstanceRecord } from '../lib/domain.types'
import { timelineMilestones } from '../lib/journey-timeline'

const base:JourneyInstanceRecord={id:'1',external_journey_id:'journey-1',status:'generated',progress:null,expires_at:null,started_at:null,identified_at:null,completed_at:null,diagnostic_summary:null,result_reference:null,created_at:'2026-10-26T17:20:00.000Z'}

describe('timeline da Jornada',()=>{
  it('mostra somente a geração em uma Jornada nova',()=>{expect(timelineMilestones(base).map(item=>item.type)).toEqual(['journey.created'])})
  it('ordena recibos e não inclui eventos de progresso',()=>{const journey={...base,status:'in_progress' as const,progress:57,timeline:[{event_type:'journey.identified' as const,occurred_at:'2026-10-26T17:29:00.000Z'},{event_type:'journey.started' as const,occurred_at:'2026-10-26T17:27:00.000Z'}]};expect(timelineMilestones(journey).map(item=>item.type)).toEqual(['journey.created','journey.started','journey.identified'])})
  it('preserva o marco de conclusão',()=>{const journey={...base,status:'completed' as const,progress:100,completed_at:'2026-10-26T17:48:00.000Z',timeline:[{event_type:'journey.completed' as const,occurred_at:'2026-10-26T17:48:00.000Z'}]};expect(timelineMilestones(journey).at(-1)?.type).toBe('journey.completed')})
  it('ignora datas inválidas e marcos terminais que não representam o estado atual',()=>{const journey={...base,started_at:'inválida',timeline:[{event_type:'journey.expired' as const,occurred_at:'2026-10-26T18:00:00.000Z'}]};expect(timelineMilestones(journey).map(item=>item.type)).toEqual(['journey.created'])})
})
