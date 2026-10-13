import { useServerFn } from '@tanstack/react-start'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AppShell } from './AppShell'
import { getProduct, saveProduct } from '../lib/catalog.functions'
import type { ProductRecord, TemplateVersion } from '../lib/domain.types'

export function ProductForm({ id }: { id?: string }) {
  const save = useServerFn(saveProduct); const go = useNavigate(); const [old, setOld] = useState<{product:ProductRecord;template:TemplateVersion}>(); const [err, setErr] = useState(''); const [pending,setPending]=useState(false)
  useEffect(() => { if (id) getProduct({ data: { id } }).then(setOld).catch(() => setErr('Produto não encontrado.')) }, [id])
  if (id && !old && !err) return <AppShell><div className="loading-state">Carregando produto…</div></AppShell>
  if (id && !old && err) return <AppShell><div className="empty-state"><h3>{err}</h3><Link className="outline-button" to="/produtos">Voltar aos produtos</Link></div></AppShell>
  const p = old?.product; const t = old?.template
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPending(true); const f = new FormData(e.currentTarget)
    try {
      const r = await save({ data: { id, code: String(f.get('code')), name: String(f.get('name')), area: String(f.get('area')) as 'Financeiro'|'Pessoas'|'Processos'|'Estratégia', description: String(f.get('description')), objective: String(f.get('objective')), defaultDurationDays: Number(f.get('days')) || undefined, estimatedHours: Number(f.get('hours')) || undefined, teamProfile: String(f.get('team')), assumptions: String(f.get('assumptions')), exclusions: String(f.get('exclusions')), acceptanceCriteria: String(f.get('acceptance')), checklist: String(f.get('checklist')).split('\n').filter(Boolean), indicators: String(f.get('indicators')).split('\n').filter(Boolean), status: String(f.get('status')) as 'draft'|'active'|'inactive' } })
      await go({ to: '/produtos/$productId', params: { productId: r.id } })
    } catch { setErr('Não foi possível salvar.') } finally { setPending(false) }
  }
  return <AppShell><div className="breadcrumbs"><Link to="/produtos">Produtos</Link><span>/</span><span>{id?'Editar':'Novo'}</span></div><header className="page-head"><div><p className="eyebrow">CATÁLOGO</p><h1>{id ? 'Editar produto' : 'Novo produto'}</h1></div></header><form className="crud-form" onSubmit={submit}>
    <label>Código<input name="code" defaultValue={p?.code} required /></label><label>Nome<input name="name" defaultValue={p?.name} required /></label>
    <label>Área<select name="area" defaultValue={p?.area ?? 'Estratégia'}>{['Financeiro', 'Pessoas', 'Processos', 'Estratégia'].map(x => <option key={x}>{x}</option>)}</select></label><label>Prazo padrão (dias)<input name="days" type="number" defaultValue={p?.default_duration_days ?? ''} /></label>
    <label>Horas estimadas<input name="hours" type="number" step="0.5" defaultValue={p?.estimated_hours ?? ''} /></label><label>Status<select name="status" defaultValue={p?.status ?? 'draft'}><option value="draft">Rascunho</option><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
    <label className="wide">Descrição<textarea name="description" defaultValue={p?.description} required /></label><label className="wide">Objetivo<textarea name="objective" defaultValue={p?.objective} required /></label>
    <label>Perfil de equipe<textarea name="team" defaultValue={p?.team_profile ?? ''} /></label><label>Critérios de conclusão<textarea name="acceptance" defaultValue={t?.acceptance_criteria ?? ''} /></label>
    <label>Premissas<textarea name="assumptions" defaultValue={p?.assumptions ?? ''} /></label><label>Exclusões<textarea name="exclusions" defaultValue={p?.exclusions ?? ''} /></label>
    <label>Checklist<textarea name="checklist" defaultValue={t?.checklist?.join('\n') ?? ''} /></label><label>Indicadores<textarea name="indicators" defaultValue={t?.indicators?.join('\n') ?? ''} /></label>
    {err && <p className="form-error wide">{err}</p>}<div className="form-actions wide"><Link className="outline-button" to="/produtos">Cancelar</Link><button className="primary-button" disabled={pending}>{pending?'Salvando…':'Salvar produto'}</button></div>
  </form></AppShell>
}
