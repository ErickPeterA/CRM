import type { OpportunityRecord } from './domain.types'

const labels: Record<OpportunityRecord['area'], string> = {
  Financeiro: 'Financeiro',
  Processos: 'Processos',
  Pessoas: 'Gestão de pessoas',
  Estratégia: 'Gestão estratégica',
}

export function areaLabel(area: OpportunityRecord['area']) {
  return labels[area]
}
