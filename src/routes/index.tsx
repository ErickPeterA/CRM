import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getCurrentUser, logout } from '../lib/auth.functions'
import { getFoundationData } from '../lib/catalog.functions'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  loader: () => getFoundationData(),
  component: Dashboard,
})

const nav = [
  ['Visão geral', '⌂'], ['CRM', '◌'], ['Comercial', '◇'], ['Projetos', '□'],
  ['Equipe', '♧'], ['Conhecimento', '⌘'], ['Indicadores', '↗'], ['Administração', '⚙'],
]

function Dashboard() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const logoutFn = useServerFn(logout)
  const navigate = useNavigate()
  const initials = user.name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">N</span><span>Nexo</span></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>{nav.map(([label, icon], index) => <a className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : `#${label.toLowerCase()}`} key={label}><b>{icon}</b>{label}{['CRM','Comercial','Projetos','Equipe','Indicadores'].includes(label) && <span>›</span>}</a>)}</nav>
        <div className="sidebar-footer"><div className="avatar">{initials}</div><div><strong>{user.name}</strong><small>{user.email}</small></div><button title="Sair" onClick={async () => { await logoutFn(); await navigate({ to: '/login' }) }}>↗</button></div>
      </aside>
      <main className="workspace">
        <header className="topbar"><div className="search">⌕ <span>Buscar clientes, projetos, pessoas…</span><kbd>⌘ K</kbd></div><div className="top-actions"><span>?</span><span>♢</span><button className="new-button">＋ Novo</button></div></header>
        <div className="content">
          <div className="welcome"><div><p className="eyebrow">TERÇA-FEIRA, 6 DE OUTUBRO</p><h1>Bom trabalho, {user.name.split(' ')[0]}.</h1><p>Aqui está o pulso da operação hoje.</p></div><button className="outline-button">Personalizar visão</button></div>
          <section className="metrics">
            <Metric label="Clientes" value={data.clients.length} note="base ativa e prospects" tone="green" />
            <Metric label="Contatos" value={data.contacts.length} note="relacionamentos mapeados" tone="blue" />
            <Metric label="Produtos" value={data.products.length} note="catálogo de consultoria" tone="violet" />
            <Metric label="Saúde da operação" value="—" note="disponível na Fase 4" tone="amber" />
          </section>
          <div className="dashboard-grid">
            <section className="card span-2"><div className="card-head"><div><p className="eyebrow">FUNIL COMERCIAL</p><h3>Pipeline por etapa</h3></div><span className="chip">Em preparação · Fase 2</span></div><div className="empty-chart"><div className="chart-bars"><i /><i /><i /><i /><i /></div><p>O pipeline aparecerá aqui quando oportunidades forem habilitadas.</p></div></section>
            <section className="card"><div className="card-head"><div><p className="eyebrow">CATÁLOGO</p><h3>Produtos recentes</h3></div></div>{data.products.length ? <div className="compact-list">{data.products.slice(0,5).map((p) => <div key={p.id}><span className="list-icon violet">◇</span><div><strong>{p.name}</strong><small>{p.code} · {p.area}</small></div><em>{p.status}</em></div>)}</div> : <Empty label="Nenhum produto cadastrado" />}</section>
            <section className="card"><div className="card-head"><div><p className="eyebrow">RELACIONAMENTO</p><h3>Clientes recentes</h3></div></div>{data.clients.length ? <div className="compact-list">{data.clients.slice(0,5).map((c) => <div key={c.id}><span className="list-icon green">{c.legal_name[0]}</span><div><strong>{c.trade_name || c.legal_name}</strong><small>{c.type === 'company' ? 'Empresa' : 'Pessoa'}</small></div><em>{c.status}</em></div>)}</div> : <Empty label="Nenhum cliente cadastrado" />}</section>
            <section className="card span-2"><div className="card-head"><div><p className="eyebrow">FLUXO DE VALOR</p><h3>Da venda à entrega</h3></div></div><div className="value-flow">{['Produto','Oportunidade','Proposta','Contrato','Projeto','Entrega'].map((step, i) => <div key={step}><span>{i + 1}</span><strong>{step}</strong>{i < 5 && <i>→</i>}</div>)}</div></section>
          </div>
        </div>
      </main>
    </div>
  )
}

function Metric({ label, value, note, tone }: { label: string; value: string | number; note: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}>↗</div><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></article>
}
function Empty({ label }: { label: string }) { return <div className="empty"><span>＋</span><p>{label}</p><small>Use as funções server-side preparadas para iniciar o cadastro.</small></div> }
