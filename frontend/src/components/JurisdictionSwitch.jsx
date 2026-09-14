import { JurisdictionMark } from './JurisdictionMark'

export default function JurisdictionSwitch({ value, onChange, copy }) {
  return (
    <div className="inline-flex border border-hairline rounded-md overflow-hidden shadow-sm bg-paper" role="group" aria-label="Jurisdiction">
      <button
        onClick={() => onChange('India')}
        aria-pressed={value === 'India'}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          value === 'India'
            ? 'bg-green text-paper shadow-inner'
            : 'text-ink/70 hover:bg-green-pale'
        }`}
      >
        <JurisdictionMark jurisdiction="India" />
        {copy.india}
      </button>
      <button
        onClick={() => onChange('International')}
        aria-pressed={value === 'International'}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-l border-hairline transition-colors ${
          value === 'International'
            ? 'bg-green text-paper shadow-inner'
            : 'text-ink/70 hover:bg-green-pale'
        }`}
      >
        <JurisdictionMark jurisdiction="International" />
        {copy.international}
      </button>
    </div>
  )
}
