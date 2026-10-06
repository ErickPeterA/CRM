import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../styles.css'
import '../styles-overrides.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Nexo — CRM & Projetos' },
      { name: 'description', content: 'Operação integrada de consultoria' },
    ],
  }),
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
