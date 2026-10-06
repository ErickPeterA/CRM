import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { login } from '../lib/auth.functions'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const loginFn = useServerFn(login)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand"><span className="brand-mark">N</span><span>Nexo</span></div>
        <div className="story-copy">
          <p className="eyebrow light">Operação de consultoria, conectada.</p>
          <h1>Do primeiro contato<br />ao aprendizado final.</h1>
          <p>Comercial e entrega no mesmo fluxo — com contexto, governança e clareza.</p>
        </div>
        <div className="story-flow"><span>OPORTUNIDADE</span><i /><span>PROJETO</span><i /><span>IMPACTO</span></div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={async (event) => {
          event.preventDefault(); setPending(true); setError('')
          const form = new FormData(event.currentTarget)
          try {
            const result = await loginFn({ data: { email: String(form.get('email')), password: String(form.get('password')) } })
            if (!result.ok) setError(result.message)
            else await navigate({ to: '/' })
          } catch { setError('Não foi possível entrar. Tente novamente.') }
          finally { setPending(false) }
        }}>
          <div className="mobile-brand"><span className="brand-mark">N</span><span>Nexo</span></div>
          <p className="eyebrow">Acesso interno</p>
          <h2>Bem-vindo de volta</h2>
          <p className="muted">Use suas credenciais corporativas para continuar.</p>
          <label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required /></label>
          <label>Senha<input name="password" type="password" autoComplete="current-password" placeholder="••••••••" minLength={8} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
          <p className="security-note">Acesso protegido · Sessões revogáveis</p>
        </form>
      </section>
    </main>
  )
}
