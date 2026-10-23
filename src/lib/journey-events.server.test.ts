import { describe, expect, it } from 'vitest'
import { isValidJourneyEventsSecret, parseJourneyEvent } from './journey-events.server'

const created={event_id:'e1',event_type:'journey.created',occurred_at:'2026-10-23T12:00:00.000Z',journey:{id:'j1'}}
describe('contrato de eventos da Jornada',()=>{
  it('valida segredo dedicado',()=>{process.env.JOURNEY_EVENTS_SECRET='events';expect(isValidJourneyEventsSecret(null)).toBe(false);expect(isValidJourneyEventsSecret('wrong')).toBe(false);expect(isValidJourneyEventsSecret('events')).toBe(true)})
  it('aceita eventos suportados',()=>{expect(parseJourneyEvent(created).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.started'}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.progress',journey:{id:'j1',progress:60}}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.completed',journey:{id:'j1',progress:100},diagnostic:{summary:{score:8},result_reference:'result-1'}}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.revoked'}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.expired'}).success).toBe(true)})
  it('valida identificação e rejeita payloads inválidos',()=>{expect(parseJourneyEvent({...created,event_type:'journey.identified',identification:{company:'Acme',name:'Ana',email:'ana@acme.test',phone:'11999999999'}}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.progress',journey:{id:'j1',progress:101}}).success).toBe(false);expect(parseJourneyEvent({event_type:'journey.unknown'}).success).toBe(false)})
})
