import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'

const LABEL_STYLE = {
  HIGH: { text: 'text-green', bar: 'bg-green', border: 'border-green/30', bg: 'bg-green-pale', Icon: ShieldCheck },
  MEDIUM: { text: 'text-gold-dark', bar: 'bg-gold', border: 'border-gold/30', bg: 'bg-gold-light/20', Icon: ShieldQuestion },
  LOW: { text: 'text-rust', bar: 'bg-rust', border: 'border-rust/30', bg: 'bg-rust/10', Icon: ShieldAlert },
}

const FACTOR_LABELS = {
  retrieval_relevance: 'Retrieval relevance',
  source_count_factor: 'Source count',
  source_authority: 'Source authority',
  agreement: 'Domain agreement',
  classification_confidence: 'Classification confidence',
}

export default function ConfidenceMeter({ confidence, label, breakdown, copy }) {
  const style = LABEL_STYLE[label] || LABEL_STYLE.LOW
  const Icon = style.Icon
  const widthPct = Math.round(Math.min(confidence, 1) * 100)

  return (
    <div className="dossier-panel p-5 sm:p-6 border-l-4 border-l-green">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <span className="section-kicker">{copy?.confidence || 'Evidence Confidence'}</span>
          <p className="text-xs text-ink/45 mt-1">How strongly the retained sources support this analysis</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-md border ${style.border} ${style.bg} ${style.text}`}>
          <Icon size={15} strokeWidth={2.2} />
          {label}
        </span>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className={`font-serif text-4xl leading-none ${style.text}`}>{widthPct}%</span>
        <span className="text-xs text-ink/45 mb-1">composite confidence</span>
      </div>
      <div className="w-full h-2 bg-hairline/60 rounded-full overflow-hidden">
        <div className={`h-2 ${style.bar} rounded-full transition-all duration-700`} style={{ width: `${widthPct}%` }} />
      </div>

      {breakdown && Object.keys(breakdown).length > 0 && (
        <dl className="mt-4 space-y-2">
          {Object.entries(breakdown).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <dt className="text-xs text-ink/60 w-44 shrink-0">{FACTOR_LABELS[k] || k.replaceAll('_', ' ')}</dt>
              <div className="flex-1 h-1 bg-hairline/50 rounded-full overflow-hidden">
                <div className="h-1 bg-green-mid/70 rounded-full" style={{ width: `${Math.round(Math.min(v, 1) * 100)}%` }} />
              </div>
              <dd className="citation-marker text-xs text-ink/50 w-10 text-right">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-[11px] text-ink/40 mt-3">
        Composite score computed from retrieval and classification signals actually produced by this analysis — never a fabricated accuracy figure.
      </p>
    </div>
  )
}
