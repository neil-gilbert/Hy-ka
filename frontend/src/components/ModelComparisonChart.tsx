import type { SummaryModel } from '../lib/types'

interface Props {
  rows: SummaryModel[]
}

export default function ModelComparisonChart({ rows }: Props) {
  if (!rows.length) {
    return <div className="card">No run summary yet.</div>
  }

  const maxCost = Math.max(...rows.map((row) => row.total_cost_usd), 0.000001)

  return (
    <div className="card chart-wrap">
      <h3>Quality vs Cost</h3>
      <svg viewBox="0 0 760 320" className="chart" role="img" aria-label="Quality versus cost chart">
        <line x1="80" y1="260" x2="720" y2="260" stroke="var(--line)" />
        <line x1="80" y1="40" x2="80" y2="260" stroke="var(--line)" />
        <text x="720" y="285" className="axis-label">
          Cost (USD)
        </text>
        <text x="8" y="40" className="axis-label">
          Quality
        </text>

        {rows.map((row, index) => {
          const x = 80 + (row.total_cost_usd / maxCost) * 640
          const y = 260 - row.quality_avg * 220
          return (
            <g key={row.model_arm_id}>
              <circle cx={x} cy={y} r={12} fill="var(--accent-2)" opacity={0.8} />
              <circle cx={x} cy={y} r={6} fill="var(--ink)" />
              <text x={x + 14} y={y - 14 + index * 2} className="point-label">
                {row.display_name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
