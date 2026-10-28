import { describe, expect, it } from 'vitest'
import { isValidJourneyEventsSecret, journeyEventPlan, journeyTransition, parseJourneyEvent } from './journey-events.server'

const eventId='123e4567-e89b-42d3-a456-426614174000'
const created={event_id:eventId,event_type:'journey.created',occurred_at:'2026-10-23T12:00:00.000Z',journey:{id:'j1'}}

describe('contrato de eventos da Jornada',()=>{
  it('valida segredo dedicado',()=>{process.env.JOURNEY_EVENTS_SECRET='events';expect(isValidJourneyEventsSecret(null)).toBe(false);expect(isValidJourneyEventsSecret('wrong')).toBe(false);expect(isValidJourneyEventsSecret('events')).toBe(true)})
  it('aceita todos os eventos suportados',()=>{expect(parseJourneyEvent(created).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.shared'}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.started'}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.progress',journey:{id:'j1',progress:60}}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.completed',journey:{id:'j1',progress:100},diagnostic:{summary:{score:8},result_reference:'result-1'}}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.revoked'}).success).toBe(true);expect(parseJourneyEvent({...created,event_type:'journey.expired'}).success).toBe(true)})
  it('exige event_id UUID e progresso válido',()=>{expect(parseJourneyEvent({...created,event_id:'e1'}).success).toBe(false);expect(parseJourneyEvent({...created,event_type:'journey.progress',journey:{id:'j1',progress:101}}).success).toBe(false);expect(parseJourneyEvent({event_type:'journey.unknown'}).success).toBe(false)})
  it('normaliza os campos de identificação',()=>{const result=parseJourneyEvent({...created,event_type:'journey.identified',identification:{company:'  Acme  ',name:'  Ana  ',email:'  ANA@ACME.TEST  ',phone:'  11999999999  ',document:'  123  ',city:'  Curitiba  ',state:' pr '}});expect(result.success).toBe(true);if(result.success&&result.data.event_type==='journey.identified')expect(result.data.identification).toEqual({company:'Acme',name:'Ana',email:'ana@acme.test',phone:'11999999999',document:'123',city:'Curitiba',state:'PR'})})
  it('rejeita identificação vazia após trim',()=>{const identification={company:'   ',name:'   ',email:'ana@acme.test',phone:'   '};expect(parseJourneyEvent({...created,event_type:'journey.identified',identification}).success).toBe(false)})
  it('mantém campos opcionais ausentes',()=>{const result=parseJourneyEvent({...created,event_type:'journey.identified',identification:{company:'Acme',name:'Ana',email:'ana@acme.test',phone:'11999999999'}});expect(result.success).toBe(true);if(result.success&&result.data.event_type==='journey.identified'){expect(result.data.identification.document).toBeUndefined();expect(result.data.identification.city).toBeUndefined();expect(result.data.identification.state).toBeUndefined()}})
})

describe('máquina de estados da Jornada',()=>{
  it('permite o fluxo progressivo completo',()=>{expect(journeyTransition('generated','journey.shared')).toBe('shared');expect(journeyTransition('shared','journey.started')).toBe('started');expect(journeyTransition('started','journey.identified')).toBe('identified');expect(journeyTransition('identified','journey.progress')).toBe('in_progress');expect(journeyTransition('in_progress','journey.completed')).toBe('completed')})
  it('mantém progresso no mesmo estado para atualizações monotônicas',()=>{expect(journeyTransition('in_progress','journey.progress')).toBe('in_progress')})
  it('impede regressões independentemente do timestamp',()=>{expect(journeyTransition('identified','journey.started')).toBeNull();expect(journeyTransition('in_progress','journey.started')).toBeNull();expect(journeyTransition('in_progress','journey.identified')).toBeNull()})
  it('protege todos os estados terminais',()=>{expect(journeyTransition('completed','journey.progress')).toBeNull();expect(journeyTransition('completed','journey.completed')).toBeNull();expect(journeyTransition('revoked','journey.identified')).toBeNull();expect(journeyTransition('expired','journey.started')).toBeNull()})
  it('permite revogar ou expirar apenas estados não terminais',()=>{expect(journeyTransition('generated','journey.revoked')).toBe('revoked');expect(journeyTransition('shared','journey.expired')).toBe('expired');expect(journeyTransition('started','journey.revoked')).toBe('revoked')})
  it('aplica identified atrasado sem regredir in_progress',()=>{expect(journeyEventPlan('in_progress','journey.identified',true)).toEqual({applyEffects:true,nextStatus:null})})
  it('aplica identified após completed sem alterar o terminal',()=>{expect(journeyEventPlan('completed','journey.identified',true)).toEqual({applyEffects:true,nextStatus:null})})
  it('aplica identified após revoked sem alterar o terminal',()=>{expect(journeyEventPlan('revoked','journey.identified',true)).toEqual({applyEffects:true,nextStatus:null})})
  it('aplica identified após expired sem alterar o terminal',()=>{expect(journeyEventPlan('expired','journey.identified',true)).toEqual({applyEffects:true,nextStatus:null})})
  it('mantém a transição normal de identified quando aplicável',()=>{expect(journeyEventPlan('started','journey.identified',false)).toEqual({applyEffects:true,nextStatus:'identified'})})
})
