import { useState } from 'react'
import { AlertTriangle, ArrowUpRight, BookOpen, CheckCircle2, FileCheck2, ShieldCheck, Sparkles } from 'lucide-react'
import { api } from './api'
import { COPY } from './copy'
import JurisdictionSwitch from './components/JurisdictionSwitch'
import { JurisdictionMark } from './components/JurisdictionMark'
import ConfidenceMeter from './components/ConfidenceMeter'
import SourceCard from './components/SourceCard'
import EscalationModal from './components/EscalationModal'
import KnowledgeGraphView from './components/KnowledgeGraphView'
import EvalDashboard from './components/EvalDashboard'
import Hero from './components/Hero'
import EvidenceBoundary from './components/EvidenceBoundary'
import Logo from './components/Logo'
import { ABSTool, TKDLTool } from './components/QuickTools'

const NAV = ['analyze', 'abs', 'tkdl', 'graph', 'eval']
const NAV_KEY = { analyze: 'navAnalyze', abs: 'navAbs', tkdl: 'navTkdl', graph: 'navGraph', eval: 'navEval' }

const CLARIFICATION_CATEGORIES = [
  'Classical / Generic Medicine',
  'Patent / Proprietary Medicine',
  'New / Non-Classical Drug',
  'Phytopharmaceutical',
  'Ayurveda-Aahar / Nutraceutical',
  'Cosmetic',
]

function ResultSkeleton({ copy }) {
  return (
    <div className="space-y-4 animate-in" aria-label={copy.loadingAnalysis}>
      <div className="dossier-panel p-6"><div className="skeleton h-3 w-28 rounded mb-4" /><div className="skeleton h-6 w-2/3 rounded mb-3" /><div className="skeleton h-4 w-5/6 rounded" /></div>
      <div className="dossier-panel p-6"><div className="skeleton h-3 w-24 rounded mb-4" /><div className="skeleton h-4 w-full rounded mb-3" /><div className="skeleton h-4 w-5/6 rounded mb-3" /><div className="skeleton h-4 w-3/4 rounded" /></div>
      <div className="dossier-panel p-6"><div className="skeleton h-4 w-1/2 rounded" /></div>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('en')
  const [jurisdiction, setJurisdiction] = useState('India')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [pendingClarification, setPendingClarification] = useState(null)
  const [tab, setTab] = useState('analyze')
  const [showEscalate, setShowEscalate] = useState(false)
  const [error, setError] = useState(null)
  const [lastConfirmedCategory, setLastConfirmedCategory] = useState(null)
  const [showHero, setShowHero] = useState(true)

  const copy = COPY[lang]

  async function runAnalyze(confirmedCategory, langOverride) {
    setLoading(true)
    setError(null)
    try {
      const payload = { query, jurisdiction, language: langOverride || lang }
      if (confirmedCategory) payload.confirmed_category = confirmedCategory
      const res = await api.analyze(payload)
      if (res.classification.needs_clarification) {
        setPendingClarification(res.classification.clarification_question)
        setResult(res)
      } else {
        setPendingClarification(null)
        setResult(res)
        setLastConfirmedCategory(confirmedCategory || res.classification.category)
      }
    } catch (e) {
      setError(copy.systemError)
    } finally {
      setLoading(false)
    }
  }

  function startAnalysis() {
    setShowHero(false)
    document.getElementById('sutradhara-query')?.focus()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative overflow-hidden border-b border-green-dark/40 bg-green text-paper sticky top-0 z-40 shadow-[0_4px_18px_rgba(20,42,31,0.14)]">
        <Logo
          size={180}
          className="pointer-events-none absolute -right-8 -top-14 text-paper opacity-[0.06]"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gold-light/35 bg-paper/10 text-gold-light shrink-0 shadow-inner">
              <Logo size={22} />
            </span>
            <div>
              <h1 className="font-serif text-2xl leading-none tracking-wide">{copy.appName}</h1>
              <p className="citation-marker text-[10px] text-gold-light/80 mt-1 tracking-[0.12em] uppercase">{copy.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex border border-paper/25 rounded-md overflow-hidden">
              <button
                onClick={() => {
                  if (lang === 'en') return
                  setLang('en')
                  if (result && !result.abstained) runAnalyze(lastConfirmedCategory, 'en')
                }}
                aria-pressed={lang === 'en'}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${lang === 'en' ? 'bg-paper text-green' : 'text-paper/80 hover:text-paper'}`}
              >
                {copy.languageEnglish}
              </button>
              <button
                onClick={() => {
                  if (lang === 'te') return
                  setLang('te')
                  if (result && !result.abstained) runAnalyze(lastConfirmedCategory, 'te')
                }}
                aria-pressed={lang === 'te'}
                className={`px-3 py-1.5 text-xs font-medium border-l border-paper/25 transition-colors ${lang === 'te' ? 'bg-paper text-green' : 'text-paper/80 hover:text-paper'}`}
              >
                {copy.languageTelugu}
              </button>
              <button
                onClick={() => {
                  if (lang === 'hi') return
                  setLang('hi')
                  if (result && !result.abstained) runAnalyze(lastConfirmedCategory, 'hi')
                }}
                aria-pressed={lang === 'hi'}
                className={`px-3 py-1.5 text-xs font-medium border-l border-paper/25 transition-colors ${lang === 'hi' ? 'bg-paper text-green' : 'text-paper/80 hover:text-paper'}`}
              >
                {copy.languageHindi}
              </button>
            </div>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 text-sm overflow-x-auto" aria-label={copy.primaryNavigation}>
          {NAV.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                tab === t ? 'border-gold bg-paper/10 text-paper' : 'border-transparent text-paper/55 hover:text-paper/90 hover:bg-paper/5'
              }`}
            >
              {copy[NAV_KEY[t]]}
            </button>
          ))}
        </nav>
        <div className="h-[2.5px] bg-green-dark/40 overflow-hidden">
          {loading && <div className="trace-line h-full w-full bg-green-dark/40" />}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {tab === 'graph' && <KnowledgeGraphView copy={copy} />}
        {tab === 'eval' && <EvalDashboard copy={copy} />}
        {tab === 'abs' && <ABSTool copy={copy} language={lang} />}
        {tab === 'tkdl' && <TKDLTool copy={copy} language={lang} />}

        {tab === 'analyze' && (
          <>
            {showHero && !result && <Hero copy={copy} onStart={startAnalysis} />}

            <div className="dossier-panel p-4 sm:p-6 mb-7 border-green/20" id="sutradhara-analyze-panel">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-pale text-green"><Sparkles size={15} /></span>
                  <div>
                    <label htmlFor="sutradhara-query" className="block text-sm font-semibold text-green-dark">{copy.inputLabel}</label>
                    <span className="text-xs text-ink/45">{copy.analysisHelper}</span>
                  </div>
                </div>
                <JurisdictionSwitch value={jurisdiction} onChange={setJurisdiction} copy={copy} />
              </div>
              <textarea
                id="sutradhara-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.placeholder}
                rows={3}
                className="research-input w-full min-h-28 border border-hairline rounded-md px-4 py-3 text-sm leading-relaxed focus:outline-none"
              />
              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink/40">
                  <JurisdictionMark jurisdiction={jurisdiction} size={13} />
                  {jurisdiction}
                </span>
                <button
                  onClick={() => { setShowHero(false); runAnalyze() }}
                  disabled={!query.trim() || loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green text-paper text-sm font-semibold rounded-md hover:bg-green-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all shadow-[0_5px_14px_rgba(31,59,44,0.18)]"
                >
                  {loading ? copy.analyzing : copy.analyze}
                  {!loading && <ArrowUpRight size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="dossier-panel p-4 mb-6 border-rust/40 bg-rust/5 flex items-start gap-2.5 animate-in">
                <AlertTriangle size={16} className="text-rust shrink-0 mt-0.5" />
                <p className="text-sm text-rust">{error}</p>
              </div>
            )}

            {loading && <ResultSkeleton copy={copy} />}

            {!loading && pendingClarification && (
              <div className="dossier-panel p-5 mb-6 border-gold/40 bg-gold-light/10 animate-in">
                <p className="text-sm font-medium mb-3">{pendingClarification}</p>
                <div className="flex gap-2 flex-wrap">
                  {CLARIFICATION_CATEGORIES.map((cat, index) => (
                    <button
                      key={cat}
                      onClick={() => runAnalyze(cat)}
                      className="text-xs border border-green/40 bg-paper px-3 py-1.5 rounded-md text-green hover:bg-green hover:text-paper transition-colors"
                    >
                      {copy.clarificationCategories[index]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && result && !pendingClarification && (
              <div className="space-y-6">
                <div className="dossier-panel p-5 sm:p-6 border-l-4 border-l-green animate-in">
                  <span className="citation-marker inline-flex items-center gap-1.5 text-xs text-green/70">
                    <JurisdictionMark jurisdiction={jurisdiction} size={13} className="text-green/70" />
                    {copy.jurisdictionPrefix}: {result.jurisdiction.toUpperCase()}
                    {result.input_language !== 'en' && (
                      <> · {copy.detectedLanguage}: {result.input_language.toUpperCase()}</>
                    )}
                  </span>
                  <div className="flex items-start gap-3 mt-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-green-pale text-green shrink-0"><FileCheck2 size={18} /></span>
                    <div>
                      <h2 className="font-serif text-xl text-green-dark">{copy.classification}</h2>
                      <p className="mt-1 text-lg font-semibold">{copy.classificationCategories?.[result.classification.category] || result.classification.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-ink/60 mt-1">{result.classification.reason}</p>

                  {result.applicable_areas.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wide text-ink/45 mb-1.5 font-medium">{copy.applicableAreas}</p>
                      <div className="flex gap-2 flex-wrap">
                        {result.applicable_areas.map((a) => (
                          <span key={a} className="text-xs border border-green/15 bg-green-pale/60 text-green-dark px-2.5 py-1 rounded-md">{copy.areaLabels?.[a] || a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.abstained ? (
                  <EvidenceBoundary result={result} copy={copy} onEscalate={() => setShowEscalate(true)} />
                ) : (
                  <>
                    <div className="dossier-panel p-5 sm:p-6 border-l-4 border-l-gold animate-in">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2"><BookOpen size={17} className="text-gold-dark" /><h3 className="font-serif text-lg">{copy.assessment}</h3></div>
                        {result.llm_paraphrased && (
                          <span className="citation-marker text-[10px] text-ink/40 border border-hairline px-2 py-0.5 rounded-full">
                            {copy.paraphraseVerified}
                          </span>
                        )}
                      </div>
                      {!result.translation_available && result.answer_language !== 'en' && (
                        <p className="text-xs text-rust mb-2">
                          {copy.translationUnavailableAnswer}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line text-ink/85">{result.answer}</p>
                    </div>

                    {result.tk_pointer && (
                      <div className="dossier-panel p-5 border-gold/40 bg-gold-light/10 animate-in">
                        <p className="section-kicker mb-1.5 font-medium">
                          {copy.tkPointer}
                        </p>
                        <p className="text-sm text-ink/75">{result.tk_pointer}</p>
                      </div>
                    )}

                    {result.abs_checklist && (
                      <div className="dossier-panel p-5 border-l-4 border-l-earth animate-in">
                        <p className="section-kicker text-ink/55 mb-2 font-medium flex items-center gap-2"><ShieldCheck size={14} className="text-earth" />
                          {copy.absConsiderations}
                        </p>
                        <ul className="text-sm space-y-1 text-ink/75">
                          <li>{result.abs_checklist.biological_resource_involved ? '☑' : '☐'} {copy.absChecklist.biologicalResource}</li>
                          <li>{result.abs_checklist.provenance_identified ? '☑' : '☐'} {copy.absChecklist.provenance}</li>
                          <li>{result.abs_checklist.abs_framework_identified ? '☑' : '☐'} {copy.absChecklist.framework}</li>
                          <li>{result.abs_checklist.supporting_source_retrieved ? '☑' : '☐'} {copy.absChecklist.source}</li>
                        </ul>
                        <p className="text-xs text-ink/50 mt-2">{result.abs_checklist.note}</p>
                      </div>
                    )}

                    <ConfidenceMeter
                      confidence={result.confidence}
                      label={result.confidence_label}
                      breakdown={result.confidence_breakdown}
                      copy={copy}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-green" /><h3 className="font-serif text-lg">{copy.sources}</h3></div>
                      </div>
                      <div className="grid gap-3">
                        {result.sources.map((s, i) => (
                          <SourceCard key={s.id} source={s} index={i} copy={copy} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                      <p className="text-xs text-ink/45 italic">{copy.disclaimer}</p>
                      <div className="text-right">
                        <p className="text-xs text-ink/55 mb-1">{copy.needExpert}</p>
                        <button
                          onClick={() => setShowEscalate(true)}
                          className="text-sm text-green underline underline-offset-2 hover:text-green-dark"
                        >
                          {copy.escalate}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-hairline py-5 text-center">
        <p className="citation-marker text-[11px] text-ink/40">{copy.appName} · {copy.team} · SIH26045</p>
      </footer>

      {showEscalate && result && (
        <EscalationModal
          copy={copy}
          context={{
            query,
            category: result.classification?.category,
            jurisdiction: result.jurisdiction,
            areas: result.applicable_areas,
            sourceIds: (result.sources || []).map((s) => s.id),
          }}
          onClose={() => setShowEscalate(false)}
        />
      )}
    </div>
  )
}
