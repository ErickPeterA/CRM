export type PipelineStage = 'entrada' | 'qualificacao' | 'diagnostico' | 'proposta' | 'negociacao' | 'ganho'

export type Opportunity = {
  id: string
  company: string
  contact: string
  email: string
  phone: string
  area: 'Estratégia' | 'Processos' | 'Pessoas' | 'Financeiro'
  stage: PipelineStage
  value: number
  temperature: 'Quente' | 'Morno' | 'Frio'
  owner: string
  dueDate: string
  initials: string
  color: string
}

export const pipelineStages: { id: PipelineStage; name: string; color: string }[] = [
  { id: 'entrada', name: 'Novas entradas', color: '#7f9189' },
  { id: 'qualificacao', name: 'Qualificação', color: '#4f8d7b' },
  { id: 'diagnostico', name: 'Diagnóstico', color: '#5289a5' },
  { id: 'proposta', name: 'Proposta', color: '#8a67ad' },
  { id: 'negociacao', name: 'Negociação', color: '#c38a3e' },
  { id: 'ganho', name: 'Ganho', color: '#5b944b' },
]

export const initialOpportunities: Opportunity[] = [
  { id: 'aurora-saude', company: 'Aurora Saúde', contact: 'Rafael Mendes', email: 'rafael@aurora.demo', phone: '(11) 99999-1002', area: 'Processos', stage: 'proposta', value: 42000, temperature: 'Quente', owner: 'Marina Costa', dueDate: 'Hoje', initials: 'AS', color: '#dff0e8' },
  { id: 'atlas-tech', company: 'Atlas Tecnologia', contact: 'Camila Rocha', email: 'camila@atlas.demo', phone: '(41) 99999-1003', area: 'Estratégia', stage: 'diagnostico', value: 28000, temperature: 'Quente', owner: 'João Lima', dueDate: '15 out', initials: 'AT', color: '#e8e5f4' },
  { id: 'horizonte-logistica', company: 'Horizonte Logística', contact: 'Marina Costa', email: 'marina@horizonte.demo', phone: '(19) 99999-1001', area: 'Financeiro', stage: 'qualificacao', value: 18500, temperature: 'Morno', owner: 'Lucas Alves', dueDate: '16 out', initials: 'HL', color: '#f5ead6' },
  { id: 'norte-alimentos', company: 'Norte Alimentos', contact: 'Paula Vieira', email: 'paula@norte.demo', phone: '(51) 99999-2001', area: 'Processos', stage: 'entrada', value: 32000, temperature: 'Morno', owner: 'Marina Costa', dueDate: '18 out', initials: 'NA', color: '#e2eee3' },
  { id: 'orbita-engenharia', company: 'Órbita Engenharia', contact: 'André Souza', email: 'andre@orbita.demo', phone: '(31) 99999-2002', area: 'Pessoas', stage: 'negociacao', value: 56000, temperature: 'Quente', owner: 'João Lima', dueDate: '14 out', initials: 'OE', color: '#e2ebf3' },
  { id: 'lumina-educacao', company: 'Lumina Educação', contact: 'Renata Dias', email: 'renata@lumina.demo', phone: '(21) 99999-2003', area: 'Pessoas', stage: 'qualificacao', value: 22500, temperature: 'Frio', owner: 'Lucas Alves', dueDate: '21 out', initials: 'LE', color: '#f3e3e5' },
  { id: 'vereda-varejo', company: 'Vereda Varejo', contact: 'Gustavo Reis', email: 'gustavo@vereda.demo', phone: '(11) 99999-2004', area: 'Estratégia', stage: 'ganho', value: 36000, temperature: 'Quente', owner: 'Marina Costa', dueDate: 'Concluído', initials: 'VV', color: '#e4f0dc' },
  { id: 'porto-digital', company: 'Porto Digital', contact: 'Bianca Freitas', email: 'bianca@porto.demo', phone: '(81) 99999-2005', area: 'Processos', stage: 'proposta', value: 47500, temperature: 'Morno', owner: 'João Lima', dueDate: '17 out', initials: 'PD', color: '#e3eef0' },
]

export const crmAreas = ['Todas as áreas', 'Estratégia', 'Processos', 'Pessoas', 'Financeiro'] as const

export function findOpportunity(id: string) {
  return initialOpportunities.find((opportunity) => opportunity.id === id)
}
