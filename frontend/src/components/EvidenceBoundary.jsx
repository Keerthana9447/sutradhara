import { ShieldAlert, Send } from 'lucide-react'

export default function EvidenceBoundary({ result, copy, onEscalate }) {
  const translationFailed = !result.translation_available && result.answer_language !== 'en'

  return (
    <div className="dossier-panel p-5 sm:p-6 border-gold/40 bg-gold-light/10 animate-in">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-gold-light/25 text-gold-dark shrink-0">
          <ShieldAlert size={18} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-xl text-green-dark">{copy.evidenceBoundary}</p>
          <p className="text-sm text-ink/70 mt-1">{result.answer || copy.evidenceBoundaryBody}</p>
        </div>
      </div>

      {translationFailed && (
        <p className="text-xs text-rust mt-3 ml-12">
          {copy.translationUnavailableMessage}
        </p>
      )}

      <div className="mt-4 ml-12 pl-4 border-l-2 border-hairline">
        <p className="text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">{copy.whyAbstained}</p>
        <p className="text-sm text-ink/65">
          {result.classification?.needs_clarification
            ? result.classification.reason
            : copy.evidenceBoundaryReason}
        </p>
      </div>

      <div className="mt-5 ml-12">
        <button
          onClick={onEscalate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green text-paper text-sm font-semibold rounded-md hover:bg-green-dark hover:-translate-y-0.5 transition-all shadow-panel"
        >
          <Send size={14} />
          {copy.escalate}
        </button>
      </div>
    </div>
  )
}
