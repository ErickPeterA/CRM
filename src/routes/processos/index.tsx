import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ProcessShell } from '../../components/ProcessShell'
import { getCurrentUser } from '../../lib/auth.functions'
import { processServices } from '../../lib/process-services'

export const Route = createFileRoute('/processos/')({
  beforeLoad: async () => { if (!await getCurrentUser()) throw redirect({ to: '/login' }) },
  component: ProcessesOverview,
})

function ProcessesOverview() {
  const categories = new Set(processServices.map((service) => service.category)).size
  return <ProcessShell title="Visão geral" eyebrow="PROCESSOS · CENTRAL DE CONHECIMENTO" action={<Link to="/processos/cadastro" className="rounded-[10px] bg-[#173e32] px-4 py-2.5 text-[11px] font-bold text-white no-underline shadow-sm transition hover:bg-[#225344]">＋ Importar documento</Link>}>
    <section className="relative overflow-hidden rounded-[22px] bg-[#173e32] px-[clamp(28px,5vw,62px)] py-[clamp(36px,5vw,58px)] text-white">
      <div className="relative z-[1] max-w-[720px]"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-[1.2px] text-[#c7e8b0]"><i className="size-1.5 rounded-full bg-[#aee574]" /> BASE OPERACIONAL</span><h2 className="mt-5 mb-3 text-[clamp(2rem,4vw,3.5rem)] leading-[1.06] font-semibold tracking-[-2px]">Transforme documentos em conhecimento executável.</h2><p className="max-w-[630px] text-[13px] leading-7 text-[#b8cdc4]">Importe seus manuais em PDF. O sistema identifica os serviços, organiza o conteúdo e prepara instruções claras para a equipe executar.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/processos/cadastro" className="rounded-[10px] bg-[#b4e879] px-5 py-3 text-[11px] font-extrabold text-[#15382e] no-underline transition hover:bg-[#c6f394]">Cadastrar por PDF →</Link><Link to="/processos/servicos" className="rounded-[10px] border border-white/15 px-5 py-3 text-[11px] font-bold text-white no-underline transition hover:bg-white/10">Ver serviços</Link></div></div>
      <div aria-hidden="true" className="absolute top-1/2 right-[-80px] size-[360px] -translate-y-1/2 rounded-full border border-white/10 shadow-[0_0_0_65px_#ffffff08,0_0_0_130px_#ffffff05] max-lg:hidden"><img src="/Logo.png" alt="" className="absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 object-contain opacity-80" /></div>
    </section>

    <section className="mt-4 grid grid-cols-3 gap-4 max-md:grid-cols-1">
      <StatCard label="Serviços identificados" value={String(processServices.length).padStart(2, '0')} note="na biblioteca atual" tone="bg-[#e5f3e1] text-[#477a2c]" />
      <StatCard label="Categorias organizadas" value={String(categories).padStart(2, '0')} note="áreas de atuação" tone="bg-[#e5f1ef] text-[#2e7268]" />
      <StatCard label="Documentos processados" value="03" note="fontes interpretadas" tone="bg-[#f7edda] text-[#94651f]" />
    </section>

    <section className="mt-4 grid grid-cols-[1.35fr_.65fr] gap-4 max-xl:grid-cols-1">
      <article className="rounded-2xl border border-[#e0e5e1] bg-white p-6"><div className="flex items-start justify-between"><div><p className="text-[9px] font-extrabold tracking-[1.4px] text-[#87938d]">SERVIÇOS RECENTES</p><h3 className="mt-1.5 text-lg font-bold">Conhecimento identificado</h3></div><Link to="/processos/servicos" className="text-[10px] font-bold text-[#2c6a55] no-underline">Ver biblioteca →</Link></div><div className="mt-5 divide-y divide-[#edf0ee]">{processServices.slice(0, 4).map((service) => <Link key={service.id} to="/processos/servicos/$serviceId" params={{ serviceId: service.id }} className="group grid grid-cols-[44px_1fr_auto] items-center gap-3 py-3.5 text-[#1a2823] no-underline"><span className="grid size-11 place-items-center rounded-xl bg-[#edf4ef] text-[10px] font-extrabold text-[#3f705d]">{service.code.split('-')[0]}</span><div><strong className="text-[12px] group-hover:text-[#2d765b]">{service.name}</strong><p className="mt-1 mb-0 text-[10px] text-[#7e8983]">{service.category} · {service.frequency}</p></div><span className="text-[#9aa59f] transition group-hover:translate-x-1">→</span></Link>)}</div></article>
      <article className="rounded-2xl border border-[#e0e5e1] bg-white p-6"><p className="text-[9px] font-extrabold tracking-[1.4px] text-[#87938d]">COMO FUNCIONA</p><h3 className="mt-1.5 text-lg font-bold">Do PDF à execução</h3><div className="mt-6 grid gap-5"><FlowStep number="1" title="Envie o documento">Adicione o manual ou procedimento em PDF.</FlowStep><FlowStep number="2" title="Interpretação">A estrutura e os serviços são identificados.</FlowStep><FlowStep number="3" title="Revise e publique">Confira o conteúdo antes de liberar para a equipe.</FlowStep></div></article>
    </section>
  </ProcessShell>
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) { return <article className="flex items-center gap-4 rounded-2xl border border-[#e0e5e1] bg-white p-5"><span className={`grid size-12 place-items-center rounded-xl text-[13px] font-extrabold ${tone}`}>↗</span><div><p className="m-0 text-[10px] text-[#76827c]">{label}</p><strong className="mt-1 block text-2xl tracking-[-1px]">{value}</strong><small className="text-[9px] text-[#9aa39e]">{note}</small></div></article> }
function FlowStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <div className="grid grid-cols-[30px_1fr] gap-3"><span className="grid size-[30px] place-items-center rounded-full bg-[#e8f2ec] text-[10px] font-extrabold text-[#28624d]">{number}</span><div><strong className="text-[11px]">{title}</strong><p className="mt-1 text-[10px] leading-5 text-[#7e8983]">{children}</p></div></div> }
