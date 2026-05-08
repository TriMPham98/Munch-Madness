import { useRef, useEffect, useState } from 'react'
import { buildDisplayRounds } from '../bracket.js'
import './BracketTree.css'

const N_COLS  = 9   // R32_L R16_L QF_L SF_L | Final | SF_R QF_R R16_R R32_R
const N_HALF  = 8   // R32 games per side
const CARD_H  = 62
const UNIT_H  = 84  // height per R32 slot within an 8-game half
const TOTAL_H = N_HALF * UNIT_H  // 672

const HEADERS = ['R32', 'R16', 'QF', 'SF', 'Final', 'SF', 'QF', 'R16', 'R32']

// Y center for matchup (localRound lr, localIndex li) within an 8-game half
function cy(lr, li) {
  return (2 * li + 1) * Math.pow(2, lr - 1) * UNIT_H
}
function cardTop(lr, li) { return cy(lr, li) - CARD_H / 2 }

export default function BracketTree({ rounds, activeRound, focusedKey }) {
  const outerRef = useRef(null)
  const [availW, setAvailW] = useState(0)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setAvailW(e.contentRect.width))
    if (outerRef.current) ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [])

  const COL_W  = availW > 0 ? availW / N_COLS : 160
  const CARD_W = COL_W * 0.80
  const COL_GAP = COL_W - CARD_W

  function colX(col) { return col * COL_W }

  const display = buildDisplayRounds(rounds, 5)

  // Split display into left (cols 0-3) and right (cols 5-8) halves
  // Left  rounds 0-3: display[r][0 .. N_HALF/2^r - 1]
  // Right rounds 0-3: display[r][N_HALF/2^r .. 2*N_HALF/2^r - 1]
  const leftHalf  = [
    display[0].slice(0, 8), display[1].slice(0, 4),
    display[2].slice(0, 2), display[3].slice(0, 1),
  ]
  const rightHalf = [
    display[0].slice(8, 16), display[1].slice(4, 8),
    display[2].slice(2, 4),  display[3].slice(1, 2),
  ]
  const final = display[4][0]

  // SVG connector lines
  const lines = []
  const accent = '#f97316', dim = '#252525'

  function addLines(lr, pi, side) {
    const isLeft  = side === 'left'
    const halfData = isLeft ? leftHalf : rightHalf
    const c1 = 2 * pi, c2 = 2 * pi + 1
    const y1 = cy(lr - 1, c1), y2 = cy(lr - 1, c2), yp = cy(lr, pi)
    const w1 = halfData[lr - 1][c1]?.winner != null
    const w2 = halfData[lr - 1][c2]?.winner != null
    const both = w1 && w2

    let cx, px, mx
    if (isLeft) {
      cx = colX(lr - 1) + CARD_W   // right edge of child card
      px = colX(lr)                 // left edge of parent card
      mx = cx + COL_GAP / 2
    } else {
      cx = colX(9 - lr)             // left edge of child card (right side reads R→L)
      px = colX(8 - lr) + CARD_W   // right edge of parent card
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
    for (let pi = 0; pi < leftHalf[lr].length;  pi++) addLines(lr, pi, 'left')
    for (let pi = 0; pi < rightHalf[lr].length; pi++) addLines(lr, pi, 'right')
  }

  // SF → Championship horizontal connections
  const sfCY       = cy(3, 0)
  const sfLWon     = leftHalf[3][0]?.winner  != null
  const sfRWon     = rightHalf[3][0]?.winner != null
  lines.push(
    <line key="F-L" x1={colX(3) + CARD_W} y1={sfCY} x2={colX(4)}         y2={sfCY} stroke={sfLWon ? accent : dim} strokeWidth={sfLWon ? 2 : 1.5} />,
    <line key="F-R" x1={colX(5)}          y1={sfCY} x2={colX(4) + CARD_W} y2={sfCY} stroke={sfRWon ? accent : dim} strokeWidth={sfRWon ? 2 : 1.5} />,
  )

  // Build cards
  const cards = []

  leftHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const key = `${lr}-${li}`
      cards.push(<Card key={key} matchup={matchup} x={colX(lr)} y={cardTop(lr, li)}
        w={CARD_W} h={CARD_H} highlighted={key === focusedKey} active={lr === activeRound} />)
    })
  })

  rightHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const gi = li + leftHalf[lr].length   // global matchup index within round lr
      const key = `${lr}-${gi}`
      const col = 8 - lr
      cards.push(<Card key={key} matchup={matchup} x={colX(col)} y={cardTop(lr, li)}
        w={CARD_W} h={CARD_H} highlighted={key === focusedKey} active={lr === activeRound} />)
    })
  })

  // Championship (global round 4, matchup 0)
  cards.push(<Card key="4-0" matchup={final} x={colX(4)} y={cardTop(3, 0)}
    w={CARD_W} h={CARD_H} highlighted={'4-0' === focusedKey} active={activeRound === 4} isFinal />)

  return (
    <div ref={outerRef} className="bt-outer">
      {availW > 0 && (
        <div className="bt-headers" style={{ height: 26 }}>
          {HEADERS.map((label, col) => (
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

function Card({ matchup, x, y, w, h, highlighted, active, isFinal }) {
  const { top, bottom, winner } = matchup
  const isUpset = winner && winner.id === bottom?.id
  const cls = ['bt-card', highlighted ? 'highlighted' : '', active ? 'cur' : '', isFinal ? 'is-final' : ''].filter(Boolean).join(' ')
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
        ? <><span className="bt-seed">{food.id}</span><span className="bt-emoji">{food.emoji}</span><span className="bt-name">{food.name}</span></>
        : <span className="bt-tbd">TBD</span>
      }
    </div>
  )
}
