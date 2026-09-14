import { useState } from 'react'
import { X, Send, CheckCircle2 } from 'lucide-react'
import { api } from '../api'

export default function EscalationModal({ context, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function submit() {
    setStatus('sending')
    try {
      await api.escalate({
        query: context.query,
        product_category: context.category,
        jurisdiction: context.jurisdiction,
        relevant_ip_area: context.areas,
        retrieved_sources: context.sourceIds,
        contact_email: email || null,
      })
      setStatus('sent')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-green-dark/65 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in" role="dialog" aria-modal="true" aria-labelledby="escalation-title">
      <div className="dossier-panel max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(20,42,31,0.28)] animate-in">
        <div className="flex items-start justify-between mb-1">
          <div><p className="section-kicker">Human review pathway</p><h3 id="escalation-title" className="font-serif text-xl text-green-dark">Escalate to IP Facilitator</h3></div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink/70 -mt-1 -mr-1 p-1">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink/60 mb-4">
          A human facilitator will review this query along with the evidence retrieved below.
        </p>

        {status === 'sent' ? (
          <div className="flex items-start gap-2 text-sm text-green bg-green-pale/60 border border-green/20 rounded-md p-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>Escalation recorded. A facilitator will follow up using the context below.</span>
          </div>
        ) : (
          <>
            <div className="text-xs text-ink/70 space-y-2 mb-4 border border-hairline rounded-md p-4 bg-paper-dim/50">
              <p><span className="font-medium">Query:</span> {context.query}</p>
              <p><span className="font-medium">Category:</span> {context.category || '—'}</p>
              <p><span className="font-medium">Jurisdiction:</span> {context.jurisdiction}</p>
              <p><span className="font-medium">Areas:</span> {(context.areas || []).join(', ') || '—'}</p>
              <p><span className="font-medium">Sources:</span> {(context.sourceIds || []).join(', ') || 'none'}</p>
            </div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Contact email (optional)</label>
            <input
              className="research-input w-full border border-hairline rounded-md px-3 py-2 text-sm mb-1 focus:outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {status === 'error' && (
              <p className="text-xs text-rust mt-1 mb-2">Could not reach the escalation service — please try again.</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-3 py-2 text-sm text-ink/60 hover:text-ink hover:bg-paper-dim rounded-md transition-colors">Cancel</button>
              <button
                onClick={submit}
                disabled={status === 'sending'}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green text-paper rounded-md hover:bg-green-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 shadow-panel"
              >
                <Send size={14} />
                {status === 'sending' ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
