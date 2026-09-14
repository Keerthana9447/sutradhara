import { useState } from 'react'
import { ChevronDown, ExternalLink, Scale } from 'lucide-react'

export default function SourceCard({ source, index, copy }) {
  const [open, setOpen] = useState(index === 0)
  const url = source.source_url?.split(' ')[0]
  const isValidUrl = url && /^https?:\/\//.test(url)

  return (
    <div className="dossier-panel overflow-hidden border-l-4 border-l-green/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-3 p-4 sm:p-5 text-left hover:bg-green-pale/40 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-pale text-green">
            <Scale size={14} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <span className="citation-marker text-[10px] text-green/70 tracking-wide">{copy.sourceLabel} {String(index + 1).padStart(2, '0')} · {source.jurisdiction}</span>
            <h4 className="font-serif text-base text-green-dark mt-0.5">{source.title}</h4>
            <p className="text-sm text-ink/60 mt-0.5">{source.section}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="citation-marker text-xs text-gold-dark bg-gold-light/15 border border-gold/20 px-2 py-1 rounded">{Math.round(source.relevance_score * 100)}% {copy.matchLabel}</span>
          <ChevronDown size={16} className={`text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-hairline bg-paper/45 animate-in">
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-ink/70 mt-3">
            <div><dt className="inline font-medium text-ink/80">{copy.sourceFields.authority}: </dt><dd className="inline">{source.authority}</dd></div>
            <div><dt className="inline font-medium text-ink/80">{copy.sourceFields.domain}: </dt><dd className="inline">{source.domain}</dd></div>
            <div><dt className="inline font-medium text-ink/80">{copy.sourceFields.type}: </dt><dd className="inline">{source.source_type}</dd></div>
            <div><dt className="inline font-medium text-ink/80">{copy.sourceFields.version}: </dt><dd className="inline">{source.version_date}</dd></div>
            <div><dt className="inline font-medium text-ink/80">{copy.sourceFields.retrieved}: </dt><dd className="inline">{source.retrieved_date}</dd></div>
            <div className="sm:col-span-2"><dt className="inline font-medium text-ink/80">{copy.sourceFields.precision}: </dt><dd className="inline">{source.precision}</dd></div>
          </dl>
          {isValidUrl ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-green hover:text-green-dark underline underline-offset-2"
            >
              {copy.viewSource} <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-[11px] text-ink/40 mt-3 italic">{source.source_url}</p>
          )}
        </div>
      )}
    </div>
  )
}
