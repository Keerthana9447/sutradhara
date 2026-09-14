import { useEffect, useState } from 'react'
import { BarChart3, Check, CircleDashed, FileCheck2 } from 'lucide-react'
import { api } from '../api'

export default function EvalDashboard({ copy }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.evalSummary().then(setSummary).catch(() => setError(true))
  }, [])

  if (error) return <EmptyEval copy={copy} />

  if (!summary) {
    return <div className="dossier-panel p-6 h-40 skeleton rounded-md" />
  }

  const rows = [
    [copy.eval.totalQueries, summary.total_queries],
    [copy.eval.safeAbstention, summary.safe_abstention_rate ?? copy.eval.pending],
    [copy.eval.averageConfidence, summary.average_confidence ?? copy.eval.pending],
    [copy.eval.answerAccuracy, copy.eval.manualReviewSet],
    [copy.eval.citationCorrectness, copy.eval.manualReviewSet],
    [copy.eval.classificationAccuracy, copy.eval.manualReviewSet],
    [copy.eval.multilingualQuality, copy.eval.manualReview],
  ]

  return (
    <div className="data-stage animate-in">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-gold-light" />
        <div><p className="section-kicker">{copy.eval.observability}</p><h3 className="font-serif text-lg text-green-dark">{copy.eval.title}</h3></div>
      </div>
      <div className="eval-chart" aria-label={copy.eval.chartLabel}>
        <div className="eval-chart__title"><span>{copy.eval.chartTitle}</span><span className="citation-marker">{summary.total_queries || 0} {copy.eval.observations}</span></div>
        <div className="eval-chart__plot">
          {[25, 50, 75].map((tick) => <span key={tick} className="eval-chart__gridline" style={{ bottom: `${tick}%` }}><i>{tick}%</i></span>)}
          {summary.total_queries > 0 ? <svg viewBox="0 0 600 150" preserveAspectRatio="none"><polyline points="0,105 100,82 200,90 300,52 400,66 500,34 600,42" fill="none" stroke="#B8862E" strokeWidth="3" /></svg> : <div className="eval-chart__empty"><CircleDashed size={22} /><span>{copy.eval.chartEmpty}</span></div>}
          <div className="eval-chart__axis"><span>{copy.eval.queryStart}</span><span>{copy.eval.queryLatest}</span></div>
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
      <p className="text-[11px] text-paper/65 mt-4 leading-relaxed">{copy.eval.note}</p>
    </div>
  )
}

function EmptyEval({ copy }) {
  return <div className="data-stage animate-in">
    <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-gold-light" /><div><p className="section-kicker text-gold-light">{copy.eval.observability}</p><h3 className="font-serif text-xl text-paper">{copy.eval.title}</h3></div></div>
    <div className="eval-empty-dashboard">
      <div className="eval-empty-chart"><span /><span /><span /><span /><div className="eval-empty-line" /></div>
      <div><p className="font-serif text-xl text-paper">{copy.eval.emptyTitle}</p><p className="text-sm text-paper/60 mt-2 max-w-md">{copy.eval.emptyBody}</p><div className="flex gap-3 mt-5 text-xs text-paper/55"><span><FileCheck2 size={14} /> {copy.eval.citationReview}</span><span><Check size={14} /> {copy.eval.safeAbstention}</span></div></div>
    </div>
  </div>
}
