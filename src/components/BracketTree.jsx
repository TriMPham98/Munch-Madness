import { useRef, useEffect, useState } from 'react'
import { buildDisplayRounds } from '../bracket.js'
import './BracketTree.css'

const N_COLS  = 4
const N_HALF  = 8
const CARD_H  = 62
const UNIT_H  = 84
const TOTAL_H = N_HALF * UNIT_H  // 672

const LEFT_HEADERS  = ['R32', 'R16', 'QF', 'SF']
const RIGHT_HEADERS = ['SF', 'QF', 'R16', 'R32']

function cy(lr, li) {
  return (2 * li + 1) * Math.pow(2, lr - 1) * UNIT_H
}
function cardTop(lr, li) { return cy(lr, li) - CARD_H / 2 }

export default function BracketTree({ rounds, activeRound, focusedKey, side }) {
  const outerRef = useRef(null)
  const [availW, setAvailW] = useState(0)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setAvailW(e.contentRect.width))
    if (outerRef.current) ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [])

  const COL_W  = availW > 0 ? availW / N_COLS : 120
  const CARD_W = COL_W * 0.80
  const COL_GAP = COL_W - CARD_W

  function colX(col) { return col * COL_W }

  const display = buildDisplayRounds(rounds, 5)

  const leftHalf  = [
    display[0].slice(0, 8), display[1].slice(0, 4),
    display[2].slice(0, 2), display[3].slice(0, 1),
  ]
  const rightHalf = [
    display[0].slice(8, 16), display[1].slice(4, 8),
    display[2].slice(2, 4),  display[3].slice(1, 2),
  ]

  const halfData = side === 'left' ? leftHalf : rightHalf
  const headers  = side === 'left' ? LEFT_HEADERS : RIGHT_HEADERS

  const lines = []
  const accent = '#f97316', dim = '#252525'

  function addLines(lr, pi) {
    const c1 = 2 * pi, c2 = 2 * pi + 1
    const y1 = cy(lr - 1, c1), y2 = cy(lr - 1, c2), yp = cy(lr, pi)
    const w1 = halfData[lr - 1][c1]?.winner != null
    const w2 = halfData[lr - 1][c2]?.winner != null
    const both = w1 && w2

    let cx, px, mx
    if (side === 'left') {
      cx = colX(lr - 1) + CARD_W
      px = colX(lr)
      mx = cx + COL_GAP / 2
    } else {
      cx = colX(4 - lr)
      px = colX(3 - lr) + CARD_W
      mx = px + COL_GAP / 2
    }

    const k = `${side}${lr}-${pi}`
    const sw = on => ({ stroke: on ? accent : dim, strokeWidth: on ? 2 : 1.5 })
    lines.push(
      <line key={`${k}h1`} x1={cx} y1={y1} x2={mx} y2={y1} {...sw(w1)} />,
      <line key={`${k}h2`} x1={cx} y1={y2} x2={mx} y2={y2} {...sw(w2)} />,
      <line key={`${k}v`}  x1={mx} y1={y1} x2={mx} y2={y2} {...sw(both)} />,
      <line key={`${k}p`}  x1={mx} y1={yp} x2={px} y2={yp} {...sw(both)} />,
    )
  }

  for (let lr = 1; lr <= 3; lr++) {
    for (let pi = 0; pi < halfData[lr].length; pi++) addLines(lr, pi)
  }

  const cards = []
  halfData.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      let key, cardX
      if (side === 'left') {
        key   = `${lr}-${li}`
        cardX = colX(lr)
      } else {
        const gi = li + leftHalf[lr].length
        key   = `${lr}-${gi}`
        cardX = colX(3 - lr)
      }
      cards.push(
        <Card key={key} matchup={matchup} x={cardX} y={cardTop(lr, li)}
          w={CARD_W} h={CARD_H} highlighted={key === focusedKey} active={lr === activeRound} />
      )
    })
  })

  return (
    <div ref={outerRef} className="bt-outer">
      {availW > 0 && (
        <div className="bt-headers" style={{ height: 26 }}>
          {headers.map((label, col) => (
            <div key={col} className="bt-header" style={{ left: colX(col), width: CARD_W }}>{label}</div>
          ))}
        </div>
      )}
      {availW > 0 && (
        <div className="bt-inner" style={{ width: availW, height: TOTAL_H }}>
          <svg className="bt-svg" width={availW} height={TOTAL_H}>{lines}</svg>
          {cards}
        </div>
      )}
    </div>
  )
}

function Card({ matchup, x, y, w, h, highlighted, active }) {
  const { top, bottom, winner } = matchup
  const opponent = winner?.id === top?.id ? bottom : top
  const isUpset = winner && opponent && winner.seed > opponent.seed
  const cls = ['bt-card', highlighted ? 'highlighted' : '', active ? 'cur' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} style={{ left: x, top: y, width: w, height: h }}>
      {isUpset && <span className="upset-badge">UPSET</span>}
      <Slot food={top} winner={winner} />
      <div className="bt-sep" />
      <Slot food={bottom} winner={winner} />
    </div>
  )
}

function Slot({ food, winner }) {
  const won  = winner && food && winner.id === food.id
  const lost = winner && food && winner.id !== food.id
  return (
    <div className={`bt-slot ${won ? 'won' : ''} ${lost ? 'lost' : ''} ${!food ? 'tbd' : ''}`}>
      {food
        ? <><span className="bt-seed">{food.seed ?? food.id}</span><span className="bt-emoji">{food.emoji}</span><span className="bt-name">{food.name}</span></>
        : <span className="bt-tbd">TBD</span>
      }
    </div>
  )
}
