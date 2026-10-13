import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { ProcessShell } from '../../../components/ProcessShell'
import { processServices } from '../../../lib/process-services'

export const Route = createFileRoute('/processos/servicos/$serviceId')({
  beforeLoad: ({ context }) => { if (!context.user) throw redirect({ to: '/login' }) },
  loader: ({ params }) => {
    const service = processServices.find((item) => item.id === params.serviceId)
    if (!service) throw notFound()
    return service
  },
  component: ServiceDetail,
})

function ServiceDetail() {
  const service = Route.useLoaderData()
  return <ProcessShell title={service.name} eyebrow={`SERVIÇOS · ${service.code}`} action={<Link to="/processos/servicos" className="rounded-[10px] border border-[#d8e0db] bg-white px-4 py-2.5 text-[10px] font-bold text-[#53635c] no-underline">← Voltar à lista</Link>}>
    <div className="grid grid-cols-[1fr_300px] gap-5 max-xl:grid-cols-1">
      <div className="grid gap-5">
        <section className="relative overflow-hidden rounded-[20px] bg-[#173e32] p-[clamp(28px,5vw,52px)] text-white"><div className="relative z-[1] max-w-[760px]"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#b1e476] px-3 py-1.5 text-[8px] font-extrabold text-[#173e32]">{service.category.toUpperCase()}</span><span className="rounded-full border border-white/15 px-3 py-1.5 text-[8px] font-bold text-[#b8cdc4]">{service.frequency.toUpperCase()}</span></div><h2 className="mt-6 mb-4 text-[clamp(2rem,4vw,3.3rem)] leading-[1.05] font-semibold tracking-[-2px]">{service.name}</h2><p className="max-w-[670px] text-[13px] leading-7 text-[#bfd0c9]">{service.description}</p></div><div aria-hidden="true" className="absolute -right-20 -bottom-36 size-[310px] rounded-full border border-white/10 shadow-[0_0_0_55px_#ffffff08,0_0_0_110px_#ffffff05]" /></section>

        <section className="rounded-[20px] border border-[#dfe5e1] bg-white p-[clamp(24px,4vw,40px)]"><div className="border-b border-[#e7ebe8] pb-6"><span className="text-[9px] font-extrabold tracking-[1.4px] text-[#7b8b83]">COMO EXECUTAR</span><h2 className="mt-2 text-2xl font-bold tracking-[-.8px]">Passo a passo</h2><p className="mt-2 text-[11px] text-[#7a8680]">Siga a sequência abaixo para executar este serviço com consistência.</p></div><ol className="mt-2 list-none p-0">{service.steps.map((step, index) => <li key={step} className="grid grid-cols-[46px_1fr] gap-4 border-b border-[#edf0ee] py-6 last:border-0"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f2ec] text-[11px] font-extrabold text-[#2d6b53]">{String(index + 1).padStart(2, '0')}</span><div><strong className="text-[12px]">{step}</strong><p className="mt-2 mb-0 text-[10px] leading-5 text-[#849089]">Registre a conclusão desta etapa e anexe evidências quando necessário.</p></div></li>)}</ol></section>
      </div>

      <aside className="grid content-start gap-4">
        <section className="rounded-2xl border border-[#dfe5e1] bg-white p-5"><p className="text-[9px] font-extrabold tracking-[1.3px] text-[#849089]">SOBRE O SERVIÇO</p><Info label="Código" value={service.code} /><Info label="Categoria" value={service.category} /><Info label="Frequência" value={service.frequency} /><Info label="Tempo estimado" value={service.estimatedTime} /></section>
        <section className="rounded-2xl border border-[#dfe5e1] bg-white p-5"><p className="text-[9px] font-extrabold tracking-[1.3px] text-[#849089]">QUANDO APLICAR</p><p className="mt-4 text-[11px] leading-6 text-[#69766f]">{service.application}</p></section>
        <section className="rounded-2xl border border-[#d5e2da] bg-[#eaf3ed] p-5"><p className="text-[9px] font-extrabold tracking-[1.3px] text-[#567566]">ORIGEM DA INFORMAÇÃO</p><div className="mt-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-white text-[#47705e]">PDF</span><div><strong className="block text-[10px]">{service.source}</strong><small className="mt-1 block text-[8px] text-[#74877d]">Conteúdo interpretado</small></div></div></section>
      </aside>
    </div>
  </ProcessShell>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="mt-4 flex items-center justify-between border-b border-[#edf0ee] pb-3 last:border-0"><span className="text-[9px] text-[#849089]">{label}</span><strong className="text-[10px]">{value}</strong></div> }
