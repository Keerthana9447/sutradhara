import { ArrowRight, Check, FileText, Landmark, Search, ShieldCheck } from 'lucide-react'
import Logo from './Logo'

const TRACE = [
  { Icon: Search, key: 'product' },
  { Icon: Landmark, key: 'classification' },
  { Icon: FileText, key: 'evidence' },
]

export default function Hero({ copy, onStart }) {
  return (
    <div className="animate-in">
      <div className="relative text-center max-w-3xl mx-auto pt-10 sm:pt-14 pb-10 px-4 overflow-hidden">
        <Logo size={360} className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 text-green opacity-[0.045]" />
        <p className="section-kicker mb-5">{copy.tagline}</p>
        <h1 className="font-serif text-5xl sm:text-6xl text-green-dark tracking-tight leading-[0.98]">{copy.appName}</h1>
        <p className="mt-6 text-base sm:text-lg text-ink/65 leading-relaxed max-w-2xl mx-auto">{copy.heroLede}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-green text-paper px-6 py-3 rounded-md text-sm font-semibold hover:bg-green-dark hover:-translate-y-0.5 transition-all shadow-[0_8px_18px_rgba(31,59,44,0.18)]"
          >
            {copy.heroCta}
            <ArrowRight size={16} />
          </button>
          <p className="text-xs text-ink/40">{copy.builtFor}</p>
        </div>
      </div>

      <div className="hero-trace mb-10">
        <div className="hero-trace__intro">
          <p className="section-kicker mb-2 text-gold-light">{copy.liveEvidenceTrail}</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-paper leading-tight">{copy.heroTraceTitle}</h2>
          <p className="text-sm text-paper/65 mt-3 max-w-sm leading-relaxed">{copy.heroTraceBody}</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-paper/55"><ShieldCheck size={15} className="text-gold-light" /> {copy.citationGrounded}</div>
        </div>
        <div className="hero-trace__steps">
          {TRACE.map(({ Icon, key }, index) => (
            <div key={key} className="trace-step" style={{ animationDelay: `${index * 100}ms` }}>
              <span className="trace-step__icon"><Icon size={16} /></span>
              <div><p className="citation-marker text-[10px] uppercase tracking-[0.12em] text-gold-light/80">{copy.heroTrace[index].label}</p><p className="text-sm text-paper/90 mt-1 leading-snug">{copy.heroTrace[index].value}</p></div>
              {index < TRACE.length - 1 && <span className="trace-step__line" aria-hidden="true" />}
            </div>
          ))}
          <div className="trace-result"><Check size={16} /><span>{copy.sourceRetained}</span><strong>{copy.confidenceHigh}</strong></div>
        </div>
      </div>
    </div>
  )
}
