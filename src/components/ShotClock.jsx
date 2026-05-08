import './ShotClock.css'

const MAX = 24
const R = 28
const CIRC = 2 * Math.PI * R

export default function ShotClock({ seconds }) {
  const pct = Math.max(0, seconds) / MAX
  const dash = pct * CIRC
  const urgent = seconds <= 5
  const warning = seconds <= 10

  const color = urgent ? '#ef4444' : warning ? '#f97316' : '#22c55e'

  return (
    <div className={`shot-clock ${urgent ? 'urgent' : ''}`}>
      <svg width={76} height={76}>
        <circle cx={38} cy={38} r={R} fill="none" stroke="#1f1f1f" strokeWidth={5} />
        <circle
          cx={38} cy={38} r={R}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
        />
        <text x={38} y={44} textAnchor="middle" fill={color} fontSize={20} fontWeight="800">
          {Math.max(0, seconds)}
        </text>
      </svg>
      <span className="shot-clock-label">SHOT CLOCK</span>
    </div>
  )
}
