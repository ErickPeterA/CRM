import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../tailwind.css'
import '../styles.css'
import '../styles-overrides.css'
import { getCurrentUser } from '../lib/auth.functions'

export const Route = createRootRoute({
  beforeLoad: async () => ({ user: await getCurrentUser() }),
  // Reuse the authenticated user while navigating, but periodically recheck
  // the session so revoked access is not kept indefinitely in the browser.
  staleTime: 5 * 60_000,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Nexo — CRM & Projetos' },
      { name: 'description', content: 'Operação integrada de consultoria' },
    ],
  }),
  errorComponent: ({ error }) => <main className="standalone-state"><p className="eyebrow">ERRO</p><h1>Não foi possível carregar esta página</h1><p>{error instanceof Error&&error.message==='NOT_FOUND'?'O registro solicitado não existe ou foi arquivado.':'Tente novamente. Se o problema persistir, procure o administrador.'}</p><Link className="primary-button" to="/">Voltar aos módulos</Link></main>,
  notFoundComponent: () => <main className="standalone-state"><p className="eyebrow">404</p><h1>Página não encontrada</h1><p>O endereço acessado não existe ou não está disponível nesta fase.</p><Link className="primary-button" to="/">Voltar aos módulos</Link></main>,
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body><Outlet /><Scripts /></body>
    </html>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="page-shell">{children}</main>
}
