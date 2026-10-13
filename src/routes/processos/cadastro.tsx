import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { ProcessShell } from '../../components/ProcessShell'

export const Route = createFileRoute('/processos/cadastro')({
  beforeLoad: ({ context }) => { if (!context.user) throw redirect({ to: '/login' }) },
  component: ProcessImport,
})

type AnalysisState = 'idle' | 'ready' | 'processing' | 'done'

function ProcessImport() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<AnalysisState>('idle')

  function selectFile(selected?: File) {
    if (!selected || selected.type !== 'application/pdf') return
    setFile(selected); setState('ready')
  }

  function analyze() {
    setState('processing')
    window.setTimeout(() => setState('done'), 1400)
  }

  return <ProcessShell title="Cadastro por PDF" eyebrow="PROCESSOS · IMPORTAÇÃO INTELIGENTE" action={<span className="rounded-full border border-[#dbe3de] bg-white px-3 py-2 text-[9px] font-bold text-[#63716a]">Leitura assistida</span>}>
    <div className="mx-auto max-w-[1050px]">
      <div className="mb-8 max-w-[690px]"><span className="text-[9px] font-extrabold tracking-[1.5px] text-[#789087]">NOVO DOCUMENTO</span><h2 className="mt-2 mb-3 text-[clamp(1.8rem,3vw,2.7rem)] font-semibold tracking-[-1.5px] text-[#17392f]">Transforme um manual em serviços organizados.</h2><p className="text-[13px] leading-6 text-[#707d77]">Envie um PDF exportado do seu sistema financeiro ou um manual interno. A leitura vai identificar títulos, descrições e etapas de execução.</p></div>

      {state !== 'done' ? <section className="grid grid-cols-[1fr_320px] gap-5 max-lg:grid-cols-1">
        <div className="rounded-[20px] border border-[#dce4df] bg-white p-5">
          <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0]) }} className={`grid min-h-[360px] w-full cursor-pointer place-content-center rounded-2xl border-2 border-dashed px-8 text-center transition ${file ? 'border-[#8fc66a] bg-[#f6faf2]' : 'border-[#cfd9d3] bg-[#fafbf9] hover:border-[#82ad94] hover:bg-[#f6f9f7]'}`}>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} />
            <span className={`mx-auto grid size-16 place-items-center rounded-2xl ${file ? 'bg-[#dff0d5] text-[#477a2c]' : 'bg-[#e7f0eb] text-[#3e725f]'}`}><PdfIcon /></span>
            {file ? <><strong className="mt-5 text-sm">{file.name}</strong><small className="mt-2 text-[10px] text-[#7e8a84]">{formatBytes(file.size)} · PDF pronto para leitura</small><span className="mt-5 text-[10px] font-bold text-[#39705b]">Clique para substituir</span></> : <><strong className="mt-5 text-sm">Arraste seu PDF para cá</strong><small className="mt-2 text-[10px] text-[#7e8a84]">ou clique para selecionar no computador</small><span className="mt-5 text-[9px] text-[#9ba49f]">PDF · máximo recomendado de 20 MB</span></>}
          </button>
          <div className="mt-4 flex items-center justify-between gap-4"><p className="m-0 text-[10px] text-[#8a958f]">O documento só será salvo após sua revisão.</p><button type="button" disabled={!file || state === 'processing'} onClick={analyze} className="min-w-[180px] cursor-pointer rounded-[10px] border-0 bg-[#173e32] px-5 py-3 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{state === 'processing' ? 'Interpretando PDF…' : 'Ler e identificar serviços →'}</button></div>
        </div>
        <aside className="rounded-[20px] bg-[#173e32] p-6 text-white"><p className="text-[9px] font-bold tracking-[1.4px] text-[#9ec0b3]">O QUE SERÁ IDENTIFICADO</p><div className="mt-7 grid gap-6"><ReadItem number="01" title="Serviços">Nomes e atividades descritas no documento.</ReadItem><ReadItem number="02" title="Contexto">O que é e quando cada serviço é aplicado.</ReadItem><ReadItem number="03" title="Execução">Etapas, responsáveis e orientações relevantes.</ReadItem><ReadItem number="04" title="Organização">Categoria, frequência e origem da informação.</ReadItem></div><div className="mt-8 rounded-xl border border-white/10 bg-white/[.06] p-4 text-[10px] leading-5 text-[#b8cdc4]">Você poderá revisar, editar ou excluir cada item antes de publicar na biblioteca.</div></aside>
      </section> : <AnalysisResult fileName={file?.name ?? 'documento.pdf'} />}
    </div>
  </ProcessShell>
}

function AnalysisResult({ fileName }: { fileName: string }) { return <section className="overflow-hidden rounded-[20px] border border-[#dce4df] bg-white"><div className="flex items-center gap-4 border-b border-[#e8ece9] bg-[#f8faf7] p-6"><span className="grid size-12 place-items-center rounded-xl bg-[#dff0d5] text-[#477a2c]">✓</span><div><p className="m-0 text-[9px] font-extrabold tracking-[1.3px] text-[#618054]">LEITURA CONCLUÍDA</p><h3 className="mt-1 text-base font-bold">6 serviços encontrados em {fileName}</h3></div></div><div className="p-6"><div className="grid gap-3">{['Conciliação bancária', 'Gestão de contas a pagar', 'Gestão de contas a receber', 'Emissão de nota fiscal de serviço', 'Fechamento financeiro mensal', 'Cadastro de fornecedor'].map((name, index) => <div key={name} className="flex items-center gap-3 rounded-xl border border-[#e5eae7] p-4"><span className="grid size-8 place-items-center rounded-lg bg-[#edf4ef] text-[10px] font-bold text-[#47705f]">{String(index + 1).padStart(2, '0')}</span><div><strong className="text-[12px]">{name}</strong><p className="mt-1 mb-0 text-[9px] text-[#849089]">Descrição e etapas identificadas</p></div><span className="ml-auto rounded-full bg-[#e9f4e3] px-2.5 py-1 text-[8px] font-bold text-[#4b7933]">PRONTO PARA REVISÃO</span></div>)}</div><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-[10px] border border-[#d8dfdb] bg-white px-5 py-3 text-[10px] font-bold text-[#5f6d66]">Salvar como rascunho</button><Link to="/processos/servicos" className="rounded-[10px] bg-[#173e32] px-5 py-3 text-[10px] font-bold text-white no-underline">Revisar serviços →</Link></div></div></section> }
function ReadItem({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <div className="grid grid-cols-[30px_1fr] gap-3"><span className="text-[10px] font-extrabold text-[#aee47a]">{number}</span><div><strong className="text-[11px]">{title}</strong><p className="mt-1 text-[10px] leading-5 text-[#9fb9af]">{children}</p></div></div> }
function PdfIcon() { return <svg viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-[1.6]"><path d="M6 2h8l4 4v16H6V2Zm8 0v5h4M9 12h6M9 16h4" /></svg> }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB` }
