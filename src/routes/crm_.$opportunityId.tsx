import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AreaBadge } from '../components/AreaBadge'
import { CrmShell } from '../components/CrmShell'
import { getOpportunity } from '../lib/commercial.functions'
import type { OpportunityStage } from '../lib/domain.types'

export const Route = createFileRoute('/crm_/$opportunityId')({
  beforeLoad: ({ context }) => { if (!context.user) throw redirect({ to: '/login' }) },
  loader: ({ params }) => getOpportunity({ data: { id: params.opportunityId } }),
  component: OpportunityWorkspace,
})

const journey: { id: OpportunityStage; label: string }[] = [
  { id: 'entrada', label: 'Entrada' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'ganho', label: 'Ganho' },
]

function OpportunityWorkspace() {
  const { opportunity, proposal } = Route.useLoaderData()
  const currentIndex = journey.findIndex((step) => step.id === opportunity.stage)

  return <CrmShell title={opportunity.company} eyebrow="CRM · FICHA DA OPORTUNIDADE" action={<div className="flex flex-wrap gap-2"><Link to="/crm" className="rounded-[10px] border border-[#d5ddd8] bg-white px-4 py-2.5 text-[10px] font-bold text-[#53655d] no-underline">← Pipeline</Link><Link to="/crm/propostas/$opportunityId" params={{ opportunityId: opportunity.id }} className="rounded-[10px] border-0 bg-[#173e32] px-4 py-2.5 text-[10px] font-bold text-white no-underline">{proposal ? 'Abrir proposta' : 'Criar proposta'} →</Link></div>}>
    <section className="overflow-hidden rounded-[22px] bg-[#173e32] text-white shadow-[0_18px_45px_rgba(23,62,50,.12)]">
      <div className="grid gap-8 p-[clamp(24px,4vw,42px)] lg:grid-cols-[1fr_auto] lg:items-end"><div><AreaBadge area={opportunity.area}/><h2 className="mt-6 mb-2 text-[clamp(1.8rem,4vw,3rem)] tracking-[-1.8px]">{opportunity.company}</h2><p className="m-0 text-[12px] text-[#b6cbc3]">Contato principal: <strong className="text-white">{opportunity.contact}</strong></p></div><div className="lg:text-right"><small className="text-[9px] text-[#91aea3]">VALOR ESTIMADO</small><strong className="mt-2 block text-3xl tracking-[-1px] text-[#b8e986]">{formatCurrency(Number(opportunity.estimated_value))}</strong><span className="mt-2 block text-[9px] text-[#9db8ad]">Responsável: {opportunity.owner_name}</span></div></div>
      <div className="border-t border-white/10 bg-black/10 px-[clamp(20px,4vw,42px)] py-5"><div className="flex min-w-[720px] items-center overflow-x-auto">{journey.map((step, index) => <div key={step.id} className="flex flex-1 items-center last:flex-none"><div className="flex items-center gap-2"><span className={`grid size-7 place-items-center rounded-full text-[9px] font-extrabold ${index < currentIndex ? 'bg-[#b8e986] text-[#173e32]' : index === currentIndex ? 'bg-white text-[#173e32]' : 'border border-white/15 text-[#78998c]'}`}>{index < currentIndex ? '✓' : index + 1}</span><strong className={`text-[9px] ${index <= currentIndex ? 'text-white' : 'text-[#78998c]'}`}>{step.label}</strong></div>{index < journey.length - 1 && <span className={`mx-3 h-px flex-1 ${index < currentIndex ? 'bg-[#b8e986]' : 'bg-white/10'}`} />}</div>)}</div></div>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
      <div className="grid content-start gap-5">
        <WorkspaceSection eyebrow="CONTEXTO" title="Resumo da oportunidade" description="Informações iniciais registradas na criação do cartão.">
          {opportunity.notes ? <p className="m-0 text-[12px] leading-6 text-[#52645c]">{opportunity.notes}</p> : <Placeholder text="Nenhuma observação inicial registrada." />}
        </WorkspaceSection>

        <div className="grid gap-5 md:grid-cols-2">
          <WorkspaceSection eyebrow="EM EVOLUÇÃO" title="Contexto e diagnóstico" description="Espaço preparado para necessidades, desafios, objetivos e cenário atual."><Placeholder text="As informações de diagnóstico poderão ser organizadas aqui." /></WorkspaceSection>
          <WorkspaceSection eyebrow="EM EVOLUÇÃO" title="Relacionamento" description="Espaço para participantes, influenciadores, decisores e registros de contato."><Placeholder text="Contatos e papéis poderão ser adicionados ao longo da negociação." /></WorkspaceSection>
          <WorkspaceSection eyebrow="EM EVOLUÇÃO" title="Solução e escopo" description="Produtos, serviços, premissas e desenho preliminar da solução."><Placeholder text="O escopo será construído conforme a oportunidade avançar." /></WorkspaceSection>
          <WorkspaceSection eyebrow="EM EVOLUÇÃO" title="Arquivos e referências" description="Documentos, apresentações, diagnósticos e materiais compartilhados."><Placeholder text="Ainda não há documentos vinculados." /></WorkspaceSection>
        </div>

        <WorkspaceSection eyebrow="HISTÓRICO" title="Linha do tempo" description="Área reservada para registrar interações e mudanças importantes.">
          <div className="flex gap-4"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#74a58f]"/><div><strong className="block text-[11px] text-[#294a3e]">Oportunidade criada</strong><p className="mt-1 mb-0 text-[9px] leading-5 text-[#85918b]">Os dados iniciais foram cadastrados e a oportunidade entrou no pipeline.</p></div></div>
        </WorkspaceSection>
      </div>

      <aside className="grid content-start gap-4">
        <section className="rounded-2xl border border-[#dfe5e1] bg-white p-5"><p className="text-[9px] font-extrabold tracking-[1.2px] text-[#7c8982]">DADOS INICIAIS</p><Info label="Etapa" value={stageLabel(opportunity.stage)} /><Info label="Área" value={opportunity.area} /><Info label="Responsável" value={opportunity.owner_name} /><Info label="Próxima ação" value={formatDate(opportunity.due_date)} /></section>
        <section className="rounded-2xl border border-[#dfe5e1] bg-white p-5"><p className="text-[9px] font-extrabold tracking-[1.2px] text-[#7c8982]">CONTATO PRINCIPAL</p><Info label="Nome" value={opportunity.contact} /><Info label="E-mail" value={opportunity.email || 'Não informado'} /><Info label="Telefone" value={opportunity.phone || 'Não informado'} /></section>
        <section className={`rounded-2xl border p-5 ${proposal ? 'border-[#d9cce5] bg-[#f6f2f8]' : 'border-[#d8e2dc] bg-[#eef5f1]'}`}><p className="text-[9px] font-extrabold tracking-[1.2px] text-[#6f7e77]">PROPOSTA COMERCIAL</p><strong className="mt-4 block text-sm text-[#294a3e]">{proposal ? proposalStatus(proposal.status) : 'Ainda não iniciada'}</strong><p className="mt-2 text-[9px] leading-5 text-[#78867f]">{proposal ? `Versão ${proposal.version} · ${formatCurrency(Number(proposal.total))}` : 'Quando fizer sentido, monte a proposta usando os dados desta oportunidade.'}</p><Link to="/crm/propostas/$opportunityId" params={{ opportunityId: opportunity.id }} className="mt-4 inline-block text-[9px] font-extrabold text-[#426d5b] no-underline">{proposal ? 'Abrir proposta' : 'Começar proposta'} →</Link></section>
      </aside>
    </section>
  </CrmShell>
}

function WorkspaceSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[20px] border border-[#dfe5e1] bg-white p-6"><p className="m-0 text-[8px] font-extrabold tracking-[1.3px] text-[#7e8c85]">{eyebrow}</p><h3 className="mt-2 mb-1 text-base text-[#24463a]">{title}</h3><p className="mt-0 mb-5 text-[9px] leading-5 text-[#87938d]">{description}</p>{children}</section> }
function Placeholder({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-[#cdd7d1] bg-[#f8faf8] px-4 py-7 text-center text-[9px] leading-5 text-[#89958f]">{text}</div> }
function Info({ label, value }: { label: string; value: string }) { return <div className="mt-4 flex items-start justify-between gap-5 border-b border-[#edf0ee] pb-3 last:border-0 last:pb-0"><span className="text-[9px] text-[#849089]">{label}</span><strong className="max-w-[190px] text-right text-[10px] text-[#304d42]">{value}</strong></div> }
function stageLabel(stage: OpportunityStage) { return journey.find((item) => item.id === stage)?.label ?? stage }
function proposalStatus(value: string) { return ({ draft: 'Proposta em rascunho', sent: 'Proposta enviada', accepted: 'Proposta aceita', rejected: 'Proposta recusada' } as Record<string, string>)[value] ?? value }
function formatCurrency(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value) }
function formatDate(value: string | null) { if (!value) return 'Não definida'; return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value.slice(0, 10)}T12:00:00`)) }
