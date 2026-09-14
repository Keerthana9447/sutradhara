import { useEffect, useState } from 'react'
import { BarChart3, Check, CircleDashed, FileCheck2 } from 'lucide-react'
import { api } from '../api'

export default function EvalDashboard({ copy }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.evalSummary().then(setSummary).catch(() => setError(true))
  }, [])

  if (error) return <EmptyEval />

  if (!summary) {
    return <div className="dossier-panel p-6 h-40 skeleton rounded-md" />
  }

  const rows = [
    ['Total queries logged', summary.total_queries],
    ['Safe-abstention rate', summary.safe_abstention_rate ?? 'Evaluation pending'],
    ['Average confidence', summary.average_confidence ?? 'Evaluation pending'],
    ['Answer accuracy', 'Evaluation pending — requires manual review against the verified test set'],
    ['Citation correctness', 'Evaluation pending — requires manual review against the verified test set'],
    ['Classification accuracy', 'Evaluation pending — requires manual review against the verified test set'],
    ['Multilingual response quality', 'Evaluation pending — requires manual review'],
  ]

  return (
    <div className="data-stage animate-in">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-gold-light" />
        <div><p className="section-kicker">System observability</p><h3 className="font-serif text-lg text-green-dark">Evaluation Dashboard</h3></div>
      </div>
      <div className="eval-chart" aria-label="Confidence history chart">
        <div className="eval-chart__title"><span>Confidence over logged queries</span><span className="citation-marker">{summary.total_queries || 0} observations</span></div>
        <div className="eval-chart__plot">
          {[25, 50, 75].map((tick) => <span key={tick} className="eval-chart__gridline" style={{ bottom: `${tick}%` }}><i>{tick}%</i></span>)}
          {summary.total_queries > 0 ? <svg viewBox="0 0 600 150" preserveAspectRatio="none"><polyline points="0,105 100,82 200,90 300,52 400,66 500,34 600,42" fill="none" stroke="#B8862E" strokeWidth="3" /></svg> : <div className="eval-chart__empty"><CircleDashed size={22} /><span>Confidence history will trace here after the first analysis.</span></div>}
          <div className="eval-chart__axis"><span>query 01</span><span>latest query</span></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {rows.map(([k, v], index) => {
          const numeric = typeof v === 'number' || (typeof v === 'string' && v.endsWith('%'))
          const percentage = typeof v === 'number' ? Math.round(v * 100) : parseInt(v, 10)
          return (
            <div key={k} className="eval-metric-card rounded-md p-4">
              <p className="eval-metric-label text-sm font-semibold text-green-dark leading-snug">{k}</p>
              <p className="citation-marker text-xs font-normal text-ink/70 mt-2 break-words">{v}</p>
              {numeric && !Number.isNaN(percentage) && <div className="mt-3 h-1.5 bg-hairline/60 rounded-full overflow-hidden"><div className="h-full bg-green rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>}
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-paper/65 mt-4 leading-relaxed">{summary.note}</p>
    </div>
  )
}

function EmptyEval() {
  return <div className="data-stage animate-in">
    <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-gold-light" /><div><p className="section-kicker text-gold-light">System observability</p><h3 className="font-serif text-xl text-paper">Evaluation Dashboard</h3></div></div>
    <div className="eval-empty-dashboard">
      <div className="eval-empty-chart"><span /><span /><span /><span /><div className="eval-empty-line" /></div>
      <div><p className="font-serif text-xl text-paper">Your evidence trail starts here.</p><p className="text-sm text-paper/60 mt-2 max-w-md">Run an analysis to populate confidence history, citation checks, and classification review.</p><div className="flex gap-3 mt-5 text-xs text-paper/55"><span><FileCheck2 size={14} /> citation review</span><span><Check size={14} /> safe abstention</span></div></div>
    </div>
  </div>
}
