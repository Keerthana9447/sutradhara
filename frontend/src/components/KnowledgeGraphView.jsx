import { useEffect, useState } from 'react'
import { Network } from 'lucide-react'
import { api } from '../api'

// Fixed 6-column layered layout (Product -> Category -> {Regime, TK} ->
// Law -> Provision -> Source). Redrawn from the original overlapping
// version: every column now has its own x, generous horizontal gutters
// between columns, and the two second-row nodes (Regime / TK) sit far
// enough apart vertically that their edges never cross a same-row label.
const POSITIONS = {
  product: { x: 70, y: 130, color: '#1F3B2C' },
  category: { x: 260, y: 130, color: '#1F3B2C' },
  regime: { x: 460, y: 60, color: '#8F6A22' },
  tk: { x: 460, y: 210, color: '#A03E2A' },
  law: { x: 660, y: 60, color: '#8F6A22' },
  provision: { x: 860, y: 60, color: '#8F6A22' },
  source: { x: 1040, y: 130, color: '#2E5940' },
}

const NODE_W = 128
const NODE_H = 40

function edgePath(from, to) {
  // Straight line for same-row edges; a gentle curve when the edge
  // changes row, so it doesn't cut directly through node boxes on an
  // intermediate column.
  if (from.y === to.y) {
    return `M ${from.x + NODE_W / 2} ${from.y} L ${to.x - NODE_W / 2} ${to.y}`
  }
  const midX = (from.x + to.x) / 2
  return `M ${from.x + NODE_W / 2} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x - NODE_W / 2} ${to.y}`
}

export default function KnowledgeGraphView({ copy }) {
  const [graph, setGraph] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.graph().then(setGraph).catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="data-stage p-8 text-center text-sm text-paper/60">
        {copy?.graphEmpty || 'Knowledge graph data is unavailable from the backend right now.'}
      </div>
    )
  }

  if (!graph) {
    return <div className="data-stage p-6 h-64 skeleton rounded-md" />
  }

  return (
    <div className="data-stage p-5 sm:p-6 animate-in">
      <div className="flex items-center gap-2 mb-1">
        <Network size={16} className="text-gold-light" />
        <div>
          <p className="section-kicker">How the answer is grounded</p>
          <h3 className="font-serif text-xl text-green-dark">Explainability Graph</h3>
        </div>
      </div>
      <p className="text-xs text-paper/65 mb-5 max-w-xl">{graph.note}</p>

      <div className="overflow-x-auto -mx-2 px-2">
        <svg viewBox="0 0 1120 270" className="w-full h-auto min-w-[760px] drop-shadow-[0_6px_8px_rgba(20,42,31,0.08)]">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#B8862E" />
            </marker>
          </defs>

          {graph.edges.map((e, i) => {
            const from = POSITIONS[e.from]
            const to = POSITIONS[e.to]
            if (!from || !to) return null
            const midX = (from.x + to.x) / 2
            const midY = from.y === to.y ? from.y : (from.y + to.y) / 2
            return (
              <g key={i}>
                <path
                  d={edgePath(from, to)}
                  fill="none"
                  stroke="#B8AA82"
                  strokeWidth="1.8"
                  markerEnd="url(#arrow)"
                />
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect x={-e.label.length * 3.1} y={-9} width={e.label.length * 6.2} height={16} rx={8} fill="#FAF7EF" stroke="#EAE0C4" />
                  <text
                    fontSize="9.5"
                    fill="#8F6A22"
                    fontFamily="IBM Plex Mono, monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    y={1}
                  >
                    {e.label}
                  </text>
                </g>
              </g>
            )
          })}

          {graph.nodes.map((n) => {
            const pos = POSITIONS[n.id]
            if (!pos) return null
            return (
              <g key={n.id}>
                <rect
                  x={pos.x - NODE_W / 2}
                  y={pos.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx="7"
                  fill="#FFFFFE"
                  stroke={pos.color}
                  strokeWidth="1.4"
                />
                <rect x={pos.x - NODE_W / 2} y={pos.y - NODE_H / 2} width="4" height={NODE_H} rx="2" fill={pos.color} />
                <text
                  x={pos.x}
                  y={pos.y}
                  fontSize="11.5"
                  fill="#1F3B2C"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-hairline flex-wrap">
        {[
          { color: '#1F3B2C', label: 'Query context' },
          { color: '#8F6A22', label: 'Regulatory structure' },
          { color: '#A03E2A', label: 'Traditional knowledge' },
          { color: '#2E5940', label: 'Authoritative source' },
        ].map(({ color, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs text-paper/70">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
