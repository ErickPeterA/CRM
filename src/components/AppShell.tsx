import { Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { logout } from '../lib/auth.functions'

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const logoutFn = useServerFn(logout)
  const { user } = useRouteContext({ from: '__root__' })
  const isAdmin = user?.permissions.includes('admin.manage')

  return <div className="app-layout">
    <aside className="sidebar">
      <Link className="brand" to="/"><img src="/Logo.png" alt="Nexo" className="size-10 object-contain" /><span>Nexo</span></Link>
      <Link to="/" title="Trocar de módulo" className="group mx-2 mt-7 overflow-hidden rounded-[14px] border border-white/10 bg-white/[.055] p-4 text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-[#8ed9c0]/40 hover:bg-white/[.09] max-[900px]:mx-0 max-[900px]:grid max-[900px]:place-items-center max-[900px]:p-3"><div className="flex items-center justify-between max-[900px]:hidden"><small className="text-[8px] font-bold tracking-[1.6px] text-[#83aa9b]">MÓDULO ATUAL</small><span className="text-[8px] text-[#789b8e] group-hover:text-[#b9dfce]">TROCAR</span></div><div className="mt-3 flex items-center justify-between max-[900px]:mt-0"><div className="grid gap-1 max-[900px]:hidden"><strong className="text-[15px] font-semibold">CRM</strong><small className="text-[8px] text-[#7fa295]">Relacionamento e vendas</small></div><ModuleSwitchIcon /></div></Link>
      <nav>
        <Link to="/crm" activeProps={{ className: 'active' }}>Visão geral</Link>
        <Link to="/clientes" activeProps={{ className: 'active' }}>Clientes</Link>
        <Link to="/contatos" activeProps={{ className: 'active' }}>Contatos</Link>
        <Link to="/produtos" activeProps={{ className: 'active' }}>Produtos</Link>
        {isAdmin && <Link to="/admin/usuarios" activeProps={{ className: 'active' }}>Administração</Link>}
      </nav>
      <div className="sidebar-user"><strong>{user?.name}</strong><small>{user?.email}</small></div>
      <button className="logout" onClick={async () => { await logoutFn(); await navigate({ to: '/login' }) }}>Sair</button>
    </aside>
    <main className="workspace"><div className="content">{children}</div></main>
  </div>
}

function ModuleSwitchIcon() { return <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-[#9fc4b5] stroke-[1.6] transition group-hover:translate-x-0.5 group-hover:stroke-[#bce8d6]"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7m-3-3 3 3-3 3"/></svg> }
