import './ShotClock.css'

const W = 48, H = 84, T = 10, GAP = 2
const sw = W - 2 * T - 2 * GAP      // horizontal segment inner width = 24
const sh = H / 2 - 3 * T / 2 - 2 * GAP  // vertical segment inner height = 23

function hPts(x, y, w, t) {
  const h = t / 2
  return `${x+h},${y} ${x+w-h},${y} ${x+w},${y+h} ${x+w-h},${y+t} ${x+h},${y+t} ${x},${y+h}`
}
function vPts(x, y, h, t) {
  const half = t / 2
  return `${x+half},${y} ${x+t},${y+half} ${x+t},${y+h-half} ${x+half},${y+h} ${x},${y+h-half} ${x},${y+half}`
}

// Precomputed segment polygons: a b c d e f g
const SEG_PTS = [
  hPts(T+GAP, GAP, sw, T),               // a top
  vPts(W-T-GAP, T+GAP, sh, T),           // b top-right
  vPts(W-T-GAP, H/2+T/2+GAP, sh, T),    // c bottom-right
  hPts(T+GAP, H-T-GAP, sw, T),           // d bottom
  vPts(GAP, H/2+T/2+GAP, sh, T),        // e bottom-left
  vPts(GAP, T+GAP, sh, T),              // f top-left
  hPts(T+GAP, H/2-T/2, sw, T),          // g middle
]

// Which segments light up per digit [a,b,c,d,e,f,g]
const SEGS = {
  0:[1,1,1,1,1,1,0], 1:[0,1,1,0,0,0,0], 2:[1,1,0,1,1,0,1],
  3:[1,1,1,1,0,0,1], 4:[0,1,1,0,0,1,1], 5:[1,0,1,1,0,1,1],
  6:[1,0,1,1,1,1,1], 7:[1,1,1,0,0,0,0], 8:[1,1,1,1,1,1,1],
  9:[1,1,1,1,0,1,1],
}

function Digit({ n, color }) {
  const on = SEGS[n] ?? SEGS[8]
  return (
    <>
      {SEG_PTS.map((pts, i) => (
        <polygon key={i} points={pts} fill={on[i] ? color : '#111'} />
      ))}
    </>
  )
}

const DIG_GAP = 10
const PAD = 14
const SVG_W = 2 * W + DIG_GAP + 2 * PAD
const SVG_H = H + 2 * PAD

export default function ShotClock({ seconds }) {
  const s = Math.max(0, seconds)
  const tens = Math.floor(s / 10)
  const ones = s % 10
  const urgent = s <= 5
  const color = urgent ? '#ef4444' : '#f97316'

  return (
    <div className={`sc-wrap ${urgent ? 'urgent' : ''}`}>
      <svg width={Math.round(SVG_W * 1.4)} height={Math.round(SVG_H * 1.4)} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="sc-svg">
        <rect width={SVG_W} height={SVG_H} rx={6} fill="#000" />
        <g transform={`translate(${PAD},${PAD})`}>
          <Digit n={tens} color={color} />
        </g>
        <g transform={`translate(${PAD + W + DIG_GAP},${PAD})`}>
          <Digit n={ones} color={color} />
        </g>
      </svg>
      <span className="sc-label">SHOT CLOCK</span>
    </div>
  )
}
