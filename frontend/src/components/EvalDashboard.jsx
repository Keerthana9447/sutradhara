import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { api } from '../api'

export default function EvalDashboard({ copy }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.evalSummary().then(setSummary).catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="dossier-panel p-8 text-center text-sm text-ink/50">
        {copy?.evalEmpty || 'No queries logged yet in this session.'}
      </div>
    )
  }

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
    <div className="dossier-panel p-5 sm:p-6 border-green/20">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-green" />
        <div><p className="section-kicker">System observability</p><h3 className="font-serif text-xl text-green-dark">Evaluation Dashboard</h3></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {rows.map(([k, v], index) => {
          const numeric = typeof v === 'number' || (typeof v === 'string' && v.endsWith('%'))
          const percentage = typeof v === 'number' ? Math.round(v * 100) : parseInt(v, 10)
          return (
            <div key={k} className={`border border-hairline rounded-md p-4 ${index < 3 ? 'bg-green-pale/35' : 'bg-paper/60'}`}>
              <p className="text-xs text-ink/60 leading-snug">{k}</p>
              <p className="citation-marker text-lg font-semibold text-green-dark mt-2 break-words">{v}</p>
              {numeric && !Number.isNaN(percentage) && <div className="mt-3 h-1.5 bg-hairline/60 rounded-full overflow-hidden"><div className="h-full bg-green rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>}
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-ink/45 mt-4 leading-relaxed">{summary.note}</p>
    </div>
  )
}
