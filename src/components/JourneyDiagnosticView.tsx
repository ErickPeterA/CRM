import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { JourneyDiagnosticSummary } from '../lib/domain.types'
import { createJourneyResultUrl } from '../lib/journey-sso.functions'

type RecordValue = Record<string,unknown>
type Props = { data:JourneyDiagnosticSummary|null; resultReference:string|null; opportunityId:string }
const dimensions:Record<string,string>={STRATEGY:'Estratégia',PROCESS:'Processos',PEOPLE:'Pessoas',FINANCE:'Financeiro'}
const known=new Set(['dimensionScores','priorities','opportunities','structuredPoints','commercialSummary','serviceScores','diagnosticMode','diagnosticReasons','investigationAreas','uncertaintyCount','uncertaintyRate','engineVersion'])

export function JourneyDiagnosticView({data,resultReference,opportunityId}:Props){
  if(!data)return <Shell>{resultReference&&<ResultAccessButton opportunityId={opportunityId}/>}<p className="text-[10px] text-[#75877f]">Nenhum resumo foi recebido.</p><Reference value={resultReference}/></Shell>
  const summary=records(data.commercialSummary), scores=records(data.dimensionScores), priorities=records(data.priorities), opportunities=records(data.opportunities), points=records(data.structuredPoints)
  const reasons=strings(data.diagnosticReasons), areas=strings(data.investigationAreas), services=serviceEntries(data.serviceScores,priorities,opportunities)
  const extras=Object.entries(data).filter(([key,value])=>!known.has(key)&&primitive(value)!==null)
  const hasContent=summary.length||scores.length||priorities.length||opportunities.length||points.length||reasons.length||areas.length||services.length||extras.length
  return <Shell>
    {resultReference&&<ResultAccessButton opportunityId={opportunityId}/>} 
    {!hasContent&&<p className="text-[10px] text-[#75877f]">O diagnóstico foi recebido, mas ainda não possui informações visuais disponíveis.</p>}
    {!!summary.length&&<Section eyebrow="RESUMO DO DIAGNÓSTICO" title="Recomendações principais"><div className="grid gap-3 lg:grid-cols-3">{summary.map((item,index)=><article key={`${text(item.need)}-${index}`} className="rounded-xl border border-[#dce7e1] bg-white p-4 shadow-[0_7px_20px_rgba(31,70,56,.04)]"><p className="text-[8px] font-extrabold tracking-[1px] text-[#789087]">NECESSIDADE {index+1}</p>{text(item.need)&&<h6 className="mt-2 text-[12px] leading-5 text-[#24463a]">{text(item.need)}</h6>}{text(item.scenario)&&<Labeled label="Cenário" value={text(item.scenario)}/>} {text(item.solution)&&<div className="mt-3 rounded-lg bg-[#eaf4ee] px-3 py-2.5"><span className="block text-[8px] font-bold uppercase tracking-[.8px] text-[#668276]">Solução recomendada</span><strong className="mt-1 block text-[10px] text-[#315d4d]">{text(item.solution)}</strong></div>}</article>)}</div></Section>}
    {!!scores.length&&<Section eyebrow="DIMENSÕES" title="Visão por área"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{scores.map((item,index)=><Dimension key={`${text(item.dimension)}-${index}`} item={item}/>)}</div></Section>}
    {!!priorities.length&&<Section eyebrow="PRIORIDADES" title="Necessidades mais relevantes"><div className="grid gap-3 xl:grid-cols-2">{priorities.map((item,index)=><Recommendation key={`${text(item.serviceCode)}-${index}`} item={item} secondary={false} index={index}/>)}</div></Section>}
    {!!opportunities.length&&<Section eyebrow="OPORTUNIDADES" title="Possibilidades complementares"><div className="grid gap-3 xl:grid-cols-2">{opportunities.map((item,index)=><Recommendation key={`${text(item.serviceCode)}-${index}`} item={item} secondary index={index}/>)}</div></Section>}
    {!!points.length&&<Section eyebrow="PONTOS ESTRUTURADOS" title="O que já está bem estabelecido"><ul className="grid list-none gap-2 p-0 sm:grid-cols-2">{points.map((item,index)=><li key={`${text(item.text)}-${index}`} className="flex items-start gap-3 rounded-xl border border-[#dce9e2] bg-[#fafffb] px-4 py-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#dcefe4] text-[10px] font-bold text-[#397258]">✓</span><div><span className="text-[10px] leading-5 text-[#405c51]">{text(item.text)}</span>{text(item.dimension)&&<p className="mt-0.5 text-[8px] font-bold uppercase tracking-[.7px] text-[#8a9992]">{dimension(text(item.dimension))}</p>}</div></li>)}</ul></Section>}
    {(reasons.length>0||areas.length>0||num(data.uncertaintyCount)!==null||num(data.uncertaintyRate)!==null)&&<Section eyebrow="OUTRAS INFORMAÇÕES" title="Contexto do diagnóstico" muted><div className="grid gap-3 sm:grid-cols-2">{reasons.length>0&&<TextList title="Motivos do diagnóstico" items={reasons}/>} {areas.length>0&&<TextList title="Áreas para investigação" items={areas}/>} {num(data.uncertaintyCount)!==null&&<Stat label="Respostas com incerteza" value={String(num(data.uncertaintyCount))}/>} {num(data.uncertaintyRate)!==null&&<Stat label="Taxa de incerteza" value={new Intl.NumberFormat('pt-BR',{style:'percent',maximumFractionDigits:1}).format(num(data.uncertaintyRate)!)}/>}</div></Section>}
    {!!services.length&&<Section eyebrow="SERVIÇOS SINALIZADOS" title="Aderência às recomendações" muted><div className="flex flex-wrap gap-2">{services.map(item=><span key={item.code} className="rounded-full border border-[#dce5e0] bg-white px-3 py-2 text-[9px] text-[#60736a]"><strong className="text-[#355d4d]">{item.name}</strong> · score {item.score}</span>)}</div></Section>}
    <Technical data={data} extras={extras} resultReference={resultReference}/>
  </Shell>
}

function ResultAccessButton({opportunityId}:{opportunityId:string}){
  const createUrl=useServerFn(createJourneyResultUrl),navigate=useNavigate()
  const [loading,setLoading]=useState(false),[error,setError]=useState(false)
  async function openResult(){
    if(loading)return
    const resultWindow=window.open('about:blank','_blank')
    setLoading(true);setError(false)
    try{
      const url=await createUrl({data:{opportunityId}})
      if(resultWindow){resultWindow.opener=null;resultWindow.location.replace(url)}
      else window.location.assign(url)
    }catch(cause){
      resultWindow?.close()
      if(cause instanceof Error&&cause.message.includes('AUTHENTICATION_REQUIRED')){await navigate({to:'/login'});return}
      setError(true)
    }finally{setLoading(false)}
  }
  return <div><button type="button" onClick={openResult} disabled={loading} className="cursor-pointer rounded-[10px] border-0 bg-[#173e32] px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#245545] disabled:cursor-wait disabled:opacity-60">{loading?'Abrindo resultado...':'Abrir resultado completo ↗'}</button>{error&&<p role="alert" className="mt-2 text-[9px] text-[#a04435]">Não foi possível abrir o resultado completo. Tente novamente.</p>}</div>
}

function Shell({children}:{children:ReactNode}){return <div className="mt-5 border-t border-[#d9e6df] pt-5"><h4 className="text-sm text-[#294a3e]">Diagnóstico da Jornada</h4><div className="mt-4 grid gap-6">{children}</div></div>}
function Section({eyebrow,title,muted=false,children}:{eyebrow:string;title:string;muted?:boolean;children:ReactNode}){return <section className={muted?'rounded-xl border border-[#e1e7e3] bg-[#f8faf8] p-4':'grid gap-3'}><header><p className="text-[8px] font-extrabold tracking-[1.2px] text-[#6d8479]">{eyebrow}</p><h5 className="mt-1 text-[13px] text-[#294a3e]">{title}</h5></header>{children}</section>}
function Dimension({item}:{item:RecordValue}){const score=Math.max(0,Math.min(100,num(item.score)??0)),name=text(item.name)||dimension(text(item.dimension)),questions=num(item.evaluatedQuestions);return <article className="rounded-xl border border-[#dce6e1] bg-white p-4"><div className="flex items-start justify-between gap-2"><h6 className="text-[11px] text-[#294a3e]">{name}</h6><strong className="text-lg text-[#315f4e]">{format(score)}%</strong></div>{text(item.label)&&<span className="mt-2 inline-block rounded-full bg-[#edf4f0] px-2 py-1 text-[7px] font-extrabold tracking-[.6px] text-[#527064]">{text(item.label)}</span>}<div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4ece8]" role="progressbar" aria-label={`Pontuação de ${name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><i className="block h-full rounded-full bg-[#4f8d70]" style={{width:`${score}%`}}/></div>{questions!==null&&<p className="mt-2 text-[8px] text-[#819087]">{questions} {questions===1?'pergunta avaliada':'perguntas avaliadas'}</p>}</article>}
function Recommendation({item,secondary,index}:{item:RecordValue;secondary:boolean;index:number}){const evidence=strings(item.evidence);return <article className={`rounded-xl border border-[#dfe6e2] border-l-4 ${secondary?'border-l-[#8aa79a]':'border-l-[#4f8d70]'} bg-white p-4`}><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[8px] font-extrabold tracking-[.9px] text-[#7c8e85]">{secondary?'OPORTUNIDADE':'PRIORIDADE'} {index+1}</span>{num(item.score)!==null&&<span className="rounded-full bg-[#edf4f0] px-2 py-1 text-[8px] font-bold text-[#456b5b]">Score {num(item.score)}</span>}</div>{text(item.need)&&<h6 className="mt-2 text-[12px] leading-5 text-[#294a3e]">{text(item.need)}</h6>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{text(item.serviceName)&&<Labeled label="Serviço recomendado" value={text(item.serviceName)}/>} {text(item.dimension)&&<Labeled label="Dimensão" value={dimension(text(item.dimension))}/>}</div>{text(item.interpretation)&&<Labeled label="Interpretação" value={text(item.interpretation)}/>} {evidence.length>0&&<div className="mt-3"><p className="text-[8px] font-bold uppercase tracking-[.7px] text-[#829088]">Evidências</p><ul className="mt-1 grid list-none gap-1 p-0">{evidence.map((value,i)=><li key={`${value}-${i}`} className="text-[9px] leading-5 text-[#65756d]">• {value}</li>)}</ul></div>}</article>}
function Labeled({label,value}:{label:string;value:string}){return <div className="mt-3"><span className="block text-[8px] font-bold uppercase tracking-[.7px] text-[#829088]">{label}</span><p className="mt-1 text-[9px] leading-5 text-[#607168]">{value}</p></div>}
function TextList({title,items}:{title:string;items:string[]}){return <div className="rounded-lg bg-white p-3"><strong className="text-[9px] text-[#466657]">{title}</strong><ul className="mt-2 grid list-none gap-1 p-0">{items.map((item,index)=><li key={`${item}-${index}`} className="text-[9px] leading-5 text-[#6d7c75]">• {item}</li>)}</ul></div>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-lg bg-white p-3"><span className="text-[8px] uppercase tracking-[.7px] text-[#829088]">{label}</span><strong className="mt-1 block text-sm text-[#365d4d]">{value}</strong></div>}
function Technical({data,extras,resultReference}:{data:JourneyDiagnosticSummary;extras:[string,unknown][];resultReference:string|null}){if(typeof data.diagnosticMode!=='boolean'&&!text(data.engineVersion)&&!extras.length&&!resultReference)return null;return <details className="rounded-xl border border-[#e2e7e4] bg-white px-4 py-3 text-[9px] text-[#75837c]"><summary className="cursor-pointer font-bold text-[#607068]">Detalhes técnicos</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{typeof data.diagnosticMode==='boolean'&&<p><span className="text-[#8a9690]">Modo diagnóstico: </span>{data.diagnosticMode?'Sim':'Não'}</p>}{text(data.engineVersion)&&<p><span className="text-[#8a9690]">Versão do motor: </span>{text(data.engineVersion)}</p>}{extras.map(([key,value])=><p key={key}><span className="text-[#8a9690]">{friendly(key)}: </span>{primitive(value)}</p>)}<Reference value={resultReference}/></div></details>}
function Reference({value}:{value:string|null}){if(!value)return null;return /^https?:\/\//.test(value)?<a href={value} target="_blank" rel="noreferrer" className="font-bold text-[#3d705b]">Ver resultado completo →</a>:<p className="break-all"><span className="text-[#8a9690]">Referência do resultado: </span>{value}</p>}

function records(value:unknown):RecordValue[]{return Array.isArray(value)?value.filter((item):item is RecordValue=>!!item&&typeof item==='object'&&!Array.isArray(item)):[]}
function strings(value:unknown):string[]{return Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'&&item.trim().length>0):[]}
function text(value:unknown){return typeof value==='string'?value.trim():''}
function num(value:unknown){return typeof value==='number'&&Number.isFinite(value)?value:null}
function primitive(value:unknown){return typeof value==='string'||typeof value==='number'||typeof value==='boolean'?String(value):null}
function dimension(value:string){return dimensions[value]??value}
function format(value:number){return Number.isInteger(value)?String(value):value.toLocaleString('pt-BR',{maximumFractionDigits:2})}
function friendly(value:string){return value.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,letter=>letter.toUpperCase())}
function serviceEntries(value:unknown,priorities:RecordValue[],opportunities:RecordValue[]){if(!value||typeof value!=='object'||Array.isArray(value))return[];const pairs=[...priorities,...opportunities].map((item):[string,string]=>[text(item.serviceCode),text(item.serviceName)]).filter(([code,name])=>Boolean(code&&name));const names=new Map<string,string>(pairs);return Object.entries(value).flatMap(([code,score])=>{const parsed=num(score),name=names.get(code);return parsed!==null&&name?[{code,name,score:parsed}]:[]}).sort((a,b)=>b.score-a.score)}
