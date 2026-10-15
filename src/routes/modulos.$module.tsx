import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'

type ModuleInfo = { name: string; eyebrow: string; description: string; items: string[] }
type DeliveryTab = 'projetos' | 'execucao'

const moduleInfo: Record<string, ModuleInfo> = {
  processos: { name: 'Processos', eyebrow: 'OPERAÇÃO E GOVERNANÇA', description: 'Desenhe, organize e acompanhe os processos que sustentam sua operação.', items: ['Visão geral', 'Mapa de processos', 'Procedimentos', 'Indicadores'] },
  contratos: { name: 'Contratos', eyebrow: 'CONTROLE E CONFORMIDADE', description: 'Tenha clareza sobre documentos, prazos, valores e responsabilidades.', items: ['Visão geral', 'Contratos', 'Aprovações', 'Vencimentos'] },
}

const deliveryModule: ModuleInfo = { name: 'Projetos e Execução', eyebrow: 'PLANEJAMENTO E OPERAÇÃO', description: 'Planeje o trabalho e acompanhe sua execução em um único espaço.', items: [] }
const deliveryTabs: Record<DeliveryTab, ModuleInfo> = {
  projetos: { name: 'Projetos', eyebrow: 'PLANEJAMENTO E IMPACTO', description: 'Planeje iniciativas, distribua recursos e acompanhe cada marco do projeto.', items: ['Visão geral', 'Portfólio', 'Cronogramas', 'Resultados'] },
  execucao: { name: 'Execução', eyebrow: 'TRABALHO EM ANDAMENTO', description: 'Coordene atividades e acompanhe as entregas da equipe em um só lugar.', items: ['Visão geral', 'Minhas atividades', 'Equipe', 'Apontamentos'] },
}

export const Route = createFileRoute('/modulos/$module')({
  beforeLoad: ({ context }) => {
    const { user } = context
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: ModulePage,
})

function ModulePage() {
  const { module } = Route.useParams()
  const { user } = Route.useRouteContext()
  const isDeliveryModule = ['projetos-execucao', 'projetos', 'execucao'].includes(module)
  const [deliveryTab, setDeliveryTab] = useState<DeliveryTab>(module === 'execucao' ? 'execucao' : 'projetos')
  const info = isDeliveryModule ? deliveryModule : moduleInfo[module]
  const activeInfo = isDeliveryModule ? deliveryTabs[deliveryTab] : info
  if (!info) return <main className="grid min-h-screen place-content-center text-center"><p className="text-xs font-bold tracking-widest text-slate-500">MÓDULO</p><h1 className="text-4xl font-bold">Módulo não encontrado</h1><Link className="mx-auto mt-4 rounded-lg bg-[#123d32] px-5 py-3 text-white no-underline" to="/">Voltar aos módulos</Link></main>

  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr] bg-[#f5f6f2] max-md:grid-cols-[72px_1fr]">
      <aside className="fixed inset-y-0 left-0 flex w-[250px] flex-col bg-[#143b30] px-[17px] pt-7 pb-[18px] text-white max-md:w-[72px] max-md:px-2.5 max-md:pt-5">
        <Link className="flex items-center gap-3 px-2 text-[21px] font-bold text-white no-underline max-md:px-0" to="/"><img src="/Logopp.png?v=20261015-2" alt="Resulta" className="size-16 object-contain" /><strong className="max-md:hidden">Resulta</strong></Link>
        <Link to="/" title="Trocar de módulo" className="group mx-[7px] mt-[34px] mb-[18px] overflow-hidden rounded-[14px] border border-white/10 bg-white/[.055] p-4 text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#a9db8a]/40 hover:bg-white/[.09] max-md:mx-0 max-md:grid max-md:place-items-center max-md:p-3"><div className="flex items-center justify-between max-md:hidden"><small className="text-[8px] font-bold tracking-[1.6px] text-[#83aa9b]">MÓDULO ATUAL</small><span className="text-[8px] text-[#789b8e] group-hover:text-[#b9dfce]">TROCAR</span></div><div className="mt-3 flex items-center justify-between max-md:mt-0"><div className="grid gap-1 max-md:hidden"><strong className="text-[15px] font-semibold">{info.name}</strong><small className="text-[8px] text-[#7fa295]">Acessar outros espaços</small></div><ModuleSwitchIcon /></div></Link>
        {isDeliveryModule && <div className="mx-[7px] mb-5 grid grid-cols-2 gap-1 rounded-xl bg-black/10 p-1 max-md:mx-0 max-md:grid-cols-1">
          <button type="button" title="Projetos" onClick={() => setDeliveryTab('projetos')} className={`cursor-pointer rounded-lg border-0 px-2 py-2.5 text-[9px] font-bold transition ${deliveryTab === 'projetos' ? 'bg-white/12 text-white' : 'bg-transparent text-[#86a99b] hover:text-white'}`}><span className="max-md:hidden">Projetos</span><span className="hidden text-base max-md:inline">◇</span></button>
          <button type="button" title="Execução" onClick={() => setDeliveryTab('execucao')} className={`cursor-pointer rounded-lg border-0 px-2 py-2.5 text-[9px] font-bold transition ${deliveryTab === 'execucao' ? 'bg-white/12 text-white' : 'bg-transparent text-[#86a99b] hover:text-white'}`}><span className="max-md:hidden">Execução</span><span className="hidden text-base max-md:inline">▷</span></button>
        </div>}
        <nav className={`grid gap-1 ${isDeliveryModule ? '' : 'max-md:mt-9'}`}>
          {activeInfo.items.map((item, index) => <button key={`${deliveryTab}-${item}`} className={`flex items-center gap-2.5 rounded-lg border-0 px-2.5 py-3 text-left text-xs ${index === 0 ? 'bg-white/10 text-white' : 'bg-transparent text-[#9db7ad] max-md:hidden'}`} type="button" disabled={index !== 0}><span className="w-[18px]">{index === 0 ? '⌂' : '○'}</span>{item}{index !== 0 && <small className="ml-auto text-[8px] text-[#668a7c]">em breve</small>}</button>)}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-[7px] py-2.5 max-md:p-0"><span className="grid size-[34px] place-items-center rounded-full bg-[#d5ab5d] text-[10px] font-extrabold text-[#173b31]">{initials(user.name)}</span><div className="grid min-w-0 max-md:hidden"><strong className="text-[11px]">{user.name}</strong><small className="overflow-hidden text-[9px] text-ellipsis text-[#7fa294]">{user.email}</small></div></div>
      </aside>

      <main className="col-start-2 overflow-hidden px-[clamp(28px,5vw,70px)] py-10 max-md:px-[18px] max-md:py-6">
        <header className="flex items-center justify-between"><div><small className="text-[9px] font-extrabold tracking-[1.5px] text-[#77847d]">{info.eyebrow}</small><h1 className="mt-1.5 text-[34px] font-bold tracking-[-1px]">{info.name}</h1></div><span className="flex items-center gap-2 rounded-full border border-[#d9e1dc] bg-white px-3 py-2 text-[10px] text-[#607068] max-md:hidden"><i className="size-1.5 rounded-full bg-[#79bd4e]" /> Ambiente preparado</span></header>

        {isDeliveryModule && <div role="tablist" aria-label="Áreas de Projetos e Execução" className="mt-8 grid max-w-[620px] grid-cols-2 gap-1.5 rounded-2xl border border-[#dce3df] bg-white p-1.5 shadow-[0_8px_28px_rgba(25,57,47,.05)] max-sm:max-w-none">
          <button role="tab" aria-selected={deliveryTab === 'projetos'} onClick={() => setDeliveryTab('projetos')} className={`flex cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left transition ${deliveryTab === 'projetos' ? 'bg-[#173e32] text-white shadow-[0_7px_18px_rgba(23,62,50,.18)]' : 'bg-transparent text-[#68766f] hover:bg-[#f2f5f2]'}`}><span className={`grid size-8 shrink-0 place-items-center rounded-lg text-base ${deliveryTab === 'projetos' ? 'bg-white/10 text-[#b8e986]' : 'bg-[#edf2ee] text-[#315f4e]'}`}>◇</span><span><strong className="block text-[11px]">Projetos</strong><small className={`mt-0.5 block text-[8px] ${deliveryTab === 'projetos' ? 'text-[#a9c4b9]' : 'text-[#929e98]'}`}>Planejamento e marcos</small></span></button>
          <button role="tab" aria-selected={deliveryTab === 'execucao'} onClick={() => setDeliveryTab('execucao')} className={`flex cursor-pointer items-center gap-3 rounded-xl border-0 px-4 py-3 text-left transition ${deliveryTab === 'execucao' ? 'bg-[#173e32] text-white shadow-[0_7px_18px_rgba(23,62,50,.18)]' : 'bg-transparent text-[#68766f] hover:bg-[#f2f5f2]'}`}><span className={`grid size-8 shrink-0 place-items-center rounded-lg text-base ${deliveryTab === 'execucao' ? 'bg-white/10 text-[#b8e986]' : 'bg-[#edf2ee] text-[#315f4e]'}`}>▷</span><span><strong className="block text-[11px]">Execução</strong><small className={`mt-0.5 block text-[8px] ${deliveryTab === 'execucao' ? 'text-[#a9c4b9]' : 'text-[#929e98]'}`}>Atividades e entregas</small></span></button>
        </div>}

        {isDeliveryModule ? <DeliveryOverview tab={deliveryTab} /> : <>
          <section className="relative mt-10 grid min-h-[370px] grid-cols-[1.25fr_.75fr] items-center gap-8 overflow-hidden rounded-[20px] bg-[#173e32] p-[55px] text-white max-lg:grid-cols-1 max-md:min-h-[350px] max-md:p-8">
            <div className="relative z-[1]"><span className="text-[9px] font-extrabold tracking-[1.5px] text-[#b2e27c]">{activeInfo.eyebrow}</span><h2 className="my-4 max-w-[680px] text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.1] font-semibold tracking-[-1.7px]">Seu espaço de {activeInfo.name.toLowerCase()} está pronto para evoluir.</h2><p className="max-w-[600px] text-[13px] leading-7 text-[#b8cbc3]">{activeInfo.description} As funcionalidades desta área serão adicionadas nas próximas etapas.</p><Link className="mt-5 inline-flex gap-5 text-[11px] font-bold text-[#d9edc7] no-underline" to="/">Explorar outros módulos <b>→</b></Link></div>
            <div className="relative z-[1] h-[230px] max-lg:hidden" aria-hidden="true"><span className="absolute inset-[15px] rounded-full border border-[#a8de713d]" /><span className="absolute inset-12 rounded-full border border-[#a8de713d]" /><span className="absolute inset-[82px] rounded-full border border-[#a8de713d] bg-[#b0e6751a]" /><i className="absolute top-7 right-12 size-[18px] rounded-full bg-[#a9e36d] shadow-[0_0_0_7px_#a9e36d1c]" /></div>
            <div aria-hidden="true" className="absolute -right-[180px] -bottom-[250px] size-[400px] rounded-full border border-white/5 shadow-[0_0_0_70px_#ffffff08,0_0_0_140px_#ffffff05]" />
          </section>

          <section className="mt-3.5 grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
            <InfoCard number="01" title="Estrutura dedicada">Uma navegação própria para as necessidades deste módulo.</InfoCard>
            <InfoCard number="02" title="Informação conectada">Dados integrados aos demais espaços da plataforma.</InfoCard>
            <InfoCard number="03" title="Evolução contínua">Novas funções serão incorporadas sem perder simplicidade.</InfoCard>
          </section>
        </>}
      </main>
    </div>
  )
}

const deliveryContent = {
  projetos: {
    eyebrow: 'VISÃO DE PORTFÓLIO',
    title: 'Planeje com clareza. Entregue com contexto.',
    description: 'Organize objetivos, responsáveis, cronogramas e marcos antes de colocar o trabalho em movimento.',
    metrics: [['Projetos ativos', '0', 'carteira atual'], ['Marcos próximos', '0', 'próximos 30 dias'], ['Progresso médio', '—', 'sem projetos ativos']],
    lanes: [['Planejamento', 'Escopo e responsáveis'], ['Em andamento', 'Marcos e cronograma'], ['Concluídos', 'Resultados alcançados']],
    features: [['01', 'Portfólio organizado', 'Acompanhe todas as iniciativas em uma visão única.'], ['02', 'Cronograma conectado', 'Visualize prazos, marcos e dependências importantes.'], ['03', 'Resultados visíveis', 'Mantenha objetivos e entregas alinhados até o encerramento.']],
  },
  execucao: {
    eyebrow: 'OPERAÇÃO EM MOVIMENTO',
    title: 'Transforme planejamento em trabalho bem executado.',
    description: 'Dê visibilidade às prioridades, distribua atividades e acompanhe o avanço das entregas da equipe.',
    metrics: [['Atividades abertas', '0', 'fila atual'], ['Entregas próximas', '0', 'próximos 7 dias'], ['Horas apontadas', '—', 'nenhum apontamento']],
    lanes: [['A fazer', 'Prioridades organizadas'], ['Em andamento', 'Trabalho da equipe'], ['Entregue', 'Evidências e conclusão']],
    features: [['01', 'Prioridades claras', 'Organize o que precisa ser feito e em qual ordem.'], ['02', 'Responsabilidade definida', 'Conecte cada atividade à pessoa e ao prazo correto.'], ['03', 'Execução rastreável', 'Registre avanços, apontamentos e evidências das entregas.']],
  },
} as const

function DeliveryOverview({ tab }: { tab: DeliveryTab }) {
  const content = deliveryContent[tab]
  return <div key={tab} className="mt-4">
    <section className="relative grid min-h-[390px] grid-cols-[1.15fr_.85fr] items-center gap-10 overflow-hidden rounded-[24px] bg-[#153d31] p-[clamp(30px,5vw,62px)] text-white shadow-[0_24px_55px_rgba(21,61,49,.16)] max-xl:grid-cols-1">
      <div className="relative z-[2] max-w-[700px]"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-[8px] font-extrabold tracking-[1.4px] text-[#b9e98a]"><i className="size-1.5 rounded-full bg-[#9ed968] shadow-[0_0_0_5px_rgba(158,217,104,.1)]" />{content.eyebrow}</span><h2 className="mt-6 max-w-[680px] text-[clamp(2rem,4vw,3.65rem)] leading-[1.04] font-semibold tracking-[-2.5px]">{content.title}</h2><p className="mt-5 max-w-[620px] text-[13px] leading-7 text-[#b7cbc3]">{content.description}</p><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-xl bg-[#b6e97c] px-4 py-3 text-[10px] font-extrabold text-[#173e32]">ESTRUTURA PREPARADA</span><span className="rounded-xl border border-white/12 px-4 py-3 text-[10px] font-bold text-[#d1e0da]">{tab === 'projetos' ? 'PLANEJAMENTO CENTRALIZADO' : 'OPERAÇÃO CONECTADA'}</span></div></div>
      <div className="relative z-[2] rounded-[20px] border border-white/10 bg-white/[.065] p-5 shadow-[0_20px_45px_rgba(4,24,18,.18)] backdrop-blur-sm max-xl:max-w-[620px]">
        <div className="mb-5 flex items-center justify-between"><div><small className="text-[8px] font-bold tracking-[1.2px] text-[#8fb0a3]">FLUXO DA ÁREA</small><strong className="mt-1 block text-sm">{tab === 'projetos' ? 'Ciclo dos projetos' : 'Ritmo de execução'}</strong></div><span className="grid size-8 place-items-center rounded-full bg-white/10 text-[#b8e986]">↗</span></div>
        <div className="grid gap-2.5">{content.lanes.map(([title, detail], index) => <div key={title} className="flex items-center gap-3 rounded-xl border border-white/[.08] bg-[#0d2e25]/35 p-3.5"><span className={`grid size-8 shrink-0 place-items-center rounded-lg text-[9px] font-extrabold ${index === 1 ? 'bg-[#b8e986] text-[#173e32]' : 'bg-white/10 text-[#c4d7cf]'}`}>{String(index + 1).padStart(2, '0')}</span><div><strong className="block text-[11px]">{title}</strong><small className="mt-1 block text-[8px] text-[#91aa9f]">{detail}</small></div><span className="ml-auto text-[9px] text-[#77968a]">0 itens</span></div>)}</div>
      </div>
      <div aria-hidden="true" className="absolute -top-24 -right-16 size-[330px] rounded-full bg-[#7cba55]/10 blur-[8px]" /><div aria-hidden="true" className="absolute -bottom-36 left-[36%] size-[300px] rounded-full border border-white/5 shadow-[0_0_0_60px_rgba(255,255,255,.025),0_0_0_120px_rgba(255,255,255,.018)]" />
    </section>

    <section className="mt-4 grid grid-cols-3 gap-4 max-lg:grid-cols-1">{content.metrics.map(([label, value, detail], index) => <article key={label} className="group relative overflow-hidden rounded-2xl border border-[#dfe5e1] bg-white p-5 shadow-[0_8px_25px_rgba(25,57,47,.035)]"><span className={`absolute top-0 left-0 h-full w-1 ${index === 0 ? 'bg-[#70a84f]' : index === 1 ? 'bg-[#5d91a8]' : 'bg-[#9a79b4]'}`} /><div className="flex items-end justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[1.2px] text-[#829088]">{label}</p><strong className="mt-2 block text-3xl tracking-[-1.5px] text-[#173d31]">{value}</strong></div><small className="pb-1 text-[9px] text-[#929d97]">{detail}</small></div></article>)}</section>

    <section className="mt-4 grid grid-cols-[1.35fr_.65fr] gap-4 max-xl:grid-cols-1">
      <article className="overflow-hidden rounded-[20px] border border-[#dfe5e1] bg-white shadow-[0_10px_30px_rgba(25,57,47,.04)]"><header className="flex items-center justify-between border-b border-[#edf0ed] px-6 py-5"><div><p className="text-[8px] font-extrabold tracking-[1.3px] text-[#84918b]">ESTRUTURA DA ÁREA</p><h3 className="mt-1 text-base text-[#1e4035]">Tudo no lugar para começar</h3></div><span className="rounded-full bg-[#edf3ef] px-3 py-1.5 text-[8px] font-bold text-[#4e7163]">VISÃO INICIAL</span></header><div className="grid grid-cols-3 gap-px bg-[#e7ebe8] max-md:grid-cols-1">{content.features.map(([number, title, description]) => <div key={number} className="min-h-[190px] bg-white p-6"><span className="grid size-8 place-items-center rounded-lg bg-[#edf3ef] text-[9px] font-extrabold text-[#396653]">{number}</span><h4 className="mt-8 text-[13px] text-[#23463a]">{title}</h4><p className="mt-2 text-[10px] leading-5 text-[#7b8882]">{description}</p></div>)}</div></article>
      <aside className="rounded-[20px] border border-[#dfe5e1] bg-[#eef2eb] p-6"><span className="text-[8px] font-extrabold tracking-[1.3px] text-[#78887f]">PRÓXIMOS PASSOS</span><h3 className="mt-2 text-lg tracking-[-.4px] text-[#1d4035]">Um fluxo simples desde o início.</h3><div className="mt-7 grid gap-5"><Step number="1" title={tab === 'projetos' ? 'Crie a iniciativa' : 'Organize a demanda'} /><Step number="2" title={tab === 'projetos' ? 'Defina marcos e equipe' : 'Distribua responsáveis'} /><Step number="3" title={tab === 'projetos' ? 'Acompanhe os resultados' : 'Registre a conclusão'} /></div><p className="mt-8 rounded-xl border border-[#d8e1da] bg-white/70 p-4 text-[9px] leading-5 text-[#6f7e77]">Esta estrutura será conectada aos demais módulos para manter clientes, contratos e entregas no mesmo contexto.</p></aside>
    </section>
  </div>
}

function Step({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#bfcfc5] bg-white text-[8px] font-extrabold text-[#35604f]">{number}</span><div className="h-px w-4 bg-[#c8d3cc]" /><strong className="text-[10px] text-[#435c52]">{title}</strong></div>
}

function InfoCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <article className="min-h-[165px] rounded-[14px] border border-[#e0e5e1] bg-white p-6"><span className="text-[9px] font-extrabold text-[#92a098]">{number}</span><h3 className="mt-7 mb-2 text-[15px] font-semibold">{title}</h3><p className="m-0 text-[11px] leading-[1.55] text-[#78847e]">{children}</p></article>
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function ModuleSwitchIcon() { return <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-[#9fc4b5] stroke-[1.6] transition group-hover:translate-x-0.5 group-hover:stroke-[#c9efb0]"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7m-3-3 3 3-3 3"/></svg> }
