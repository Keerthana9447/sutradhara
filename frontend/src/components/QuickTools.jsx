import { useState } from 'react'
import { ShieldCheck, ScrollText, Loader2, Search, Check, Minus, AlertCircle } from 'lucide-react'
import { api } from '../api'
import JurisdictionSwitch from './JurisdictionSwitch'
import SourceCard from './SourceCard'

/**
 * Standalone, single-purpose tools that expose individual pipeline
 * capabilities on their own rather than only as panels buried inside a
 * full /api/analyze result. This lets a judge probe ABS and TKDL directly.
 *
 * ABSTool and TKDLTool call /api/analyze (the endpoint that computes
 * abs_checklist / tk_pointer) and then render only their one relevant
 * panel, discarding the rest of the response.
 */

function ToolShell({ icon: Icon, title, lede, children }) {
  return (
    <div className="animate-in">
      <div className="flex items-start gap-3 mb-1">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-green/15 bg-green-pale text-green shrink-0 mt-0.5">
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <div>
          <p className="section-kicker mb-1">Focused research tool</p>
          <h2 className="font-serif text-2xl text-green-dark leading-tight">{title}</h2>
          <p className="text-sm text-ink/60 mt-1 max-w-2xl">{lede}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function QueryBox({ value, onChange, placeholder, onSubmit, loading, buttonLabel, extra }) {
  return (
    <div className="dossier-panel p-4 sm:p-5 mb-6 border-green/20">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <span className="text-xs text-ink/40">&nbsp;</span>
        {extra}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="research-input w-full min-h-24 border border-hairline rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none"
      />
      <div className="flex justify-end mt-3">
        <button
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green text-paper text-sm font-semibold rounded-md hover:bg-green-dark hover:-translate-y-0.5 disabled:opacity-50 transition-all shadow-panel"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Working…' : buttonLabel}
        </button>
      </div>
    </div>
  )
}

export function ABSTool({ copy }) {
  const [query, setQuery] = useState('')
  const [jurisdiction, setJurisdiction] = useState('India')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.analyze({ query, jurisdiction, language: 'en' })
      setResult(res)
    } catch (e) {
      setError(copy.systemError)
    } finally {
      setLoading(false)
    }
  }

  const checklist = result?.abs_checklist

  return (
    <ToolShell icon={ShieldCheck} title={copy.absTitle} lede={copy.absLede}>
      <QueryBox
        value={query}
        onChange={setQuery}
        placeholder={copy.absPlaceholder}
        onSubmit={run}
        loading={loading}
        buttonLabel={copy.absButton}
        extra={<JurisdictionSwitch value={jurisdiction} onChange={setJurisdiction} copy={copy} />}
      />

      {error && <p className="text-sm text-rust mb-4">{error}</p>}

      {result && (
        checklist ? (
          <div className="dossier-panel p-5 border-gold/40 animate-in">
            <p className="section-kicker mb-3 font-medium flex items-center gap-2">
              <Search size={14} />
              Potential ABS Considerations
            </p>
            <ul className="text-sm space-y-2 text-ink/75">
              <li className="flex items-center gap-2">{checklist.biological_resource_involved ? <Check size={15} className="text-green" /> : <Minus size={15} className="text-ink/35" />} Biological resource involved</li>
              <li className="flex items-center gap-2">{checklist.provenance_identified ? <Check size={15} className="text-green" /> : <Minus size={15} className="text-ink/35" />} Source/provenance identified</li>
              <li className="flex items-center gap-2">{checklist.abs_framework_identified ? <Check size={15} className="text-green" /> : <Minus size={15} className="text-ink/35" />} Relevant ABS framework identified</li>
              <li className="flex items-center gap-2">{checklist.supporting_source_retrieved ? <Check size={15} className="text-green" /> : <Minus size={15} className="text-ink/35" />} Supporting source retrieved</li>
            </ul>
            <p className="text-xs text-ink/50 mt-3">{checklist.note}</p>
          </div>
        ) : (
          <div className="dossier-panel p-6 text-center text-sm text-ink/50"><AlertCircle size={18} className="mx-auto mb-2 text-gold-dark" />{copy.absNotTriggered}</div>
        )
      )}

      {!result && !loading && !error && (
        <div className="dossier-panel p-8 text-center text-sm text-ink/50">{copy.absEmpty}</div>
      )}
    </ToolShell>
  )
}

export function TKDLTool({ copy }) {
  const [query, setQuery] = useState('')
  const [jurisdiction, setJurisdiction] = useState('India')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.analyze({ query, jurisdiction, language: 'en' })
      setResult(res)
    } catch (e) {
      setError(copy.systemError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolShell icon={ScrollText} title={copy.tkdlTitle} lede={copy.tkdlLede}>
      <QueryBox
        value={query}
        onChange={setQuery}
        placeholder={copy.tkdlPlaceholder}
        onSubmit={run}
        loading={loading}
        buttonLabel={copy.tkdlButton}
        extra={<JurisdictionSwitch value={jurisdiction} onChange={setJurisdiction} copy={copy} />}
      />

      {error && <p className="text-sm text-rust mb-4">{error}</p>}

      {result && !result.needs_clarification && (
        result.tk_pointer ? (
          <>
            <div className="dossier-panel p-5 border-gold/40 animate-in mb-4">
              <p className="section-kicker mb-1.5 font-medium flex items-center gap-2">
                <Search size={14} />
                Traditional Knowledge / Prior-Art Pointer
              </p>
              <p className="text-sm text-ink/75">{result.tk_pointer}</p>
            </div>
            {result.sources?.length > 0 && (
              <div className="grid gap-3">
                {result.sources.map((s, i) => (
                  <SourceCard key={s.id} source={s} index={i} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="dossier-panel p-6 text-center text-sm text-ink/50">{copy.tkdlNotTriggered}</div>
        )
      )}

      {!result && !loading && !error && (
        <div className="dossier-panel p-8 text-center text-sm text-ink/50">{copy.tkdlEmpty}</div>
      )}
    </ToolShell>
  )
}
