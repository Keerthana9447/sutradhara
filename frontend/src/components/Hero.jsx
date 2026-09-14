import { Layers, ScrollText, Landmark, Languages, ArrowRight } from 'lucide-react'

const CAPABILITIES = [
  { Icon: Layers, title: 'IP Classification', body: 'Routes each product into the correct regulatory category before anything else runs.' },
  { Icon: Landmark, title: 'Regulatory Guidance', body: 'Jurisdiction-aware routing across patents, ABS, drug regulation, GI, and more.' },
  { Icon: ScrollText, title: 'Source-Grounded Evidence', body: 'Every claim traces back to a specific statute, rule, or treaty provision.' },
  { Icon: Languages, title: 'Multilingual Intelligence', body: 'English and Telugu queries retrieve the same authoritative evidence.' },
]

const STEPS = ['Product', 'Classification', 'IP Regime', 'Regulation', 'Evidence']

export default function Hero({ copy, onStart }) {
  return (
    <div className="animate-in">
      <div className="text-center max-w-3xl mx-auto pt-8 sm:pt-12 pb-10 px-4">
        <p className="section-kicker mb-4">{copy.tagline}</p>
        <div className="inline-flex items-center gap-2 border border-gold/25 bg-gold-light/10 rounded-full px-3 py-1 mb-4 text-xs text-gold-dark">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> Source-grounded legal intelligence
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl text-green-dark tracking-tight leading-[0.98]">{copy.appName}</h1>
        <p className="mt-6 text-base sm:text-lg text-ink/65 leading-relaxed max-w-2xl mx-auto">{copy.heroLede}</p>
        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 bg-green text-paper px-6 py-3 rounded-md text-sm font-semibold hover:bg-green-dark hover:-translate-y-0.5 transition-all shadow-[0_8px_18px_rgba(31,59,44,0.18)]"
        >
          {copy.heroCta}
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CAPABILITIES.map(({ Icon, title, body }, index) => (
          <div key={title} className="dossier-panel lift-on-hover p-5 relative overflow-hidden" style={{ animationDelay: `${index * 55}ms` }}>
            <span className="absolute top-0 left-0 right-0 h-0.5 bg-gold/50" />
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-green-pale text-green mb-4">
              <Icon size={16} strokeWidth={2.2} />
            </span>
            <h3 className="font-semibold text-sm text-green-dark">{title}</h3>
            <p className="text-xs text-ink/55 mt-1 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="dossier-panel p-5 sm:p-6 mb-10">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className={`citation-marker w-8 h-8 rounded-full ${i === 0 ? 'bg-gold text-green-dark' : 'bg-green text-paper'} text-[11px] flex items-center justify-center shrink-0 border border-green/10`}>
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm text-ink/75 whitespace-nowrap">{step}</span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight size={15} className="text-gold/60" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
