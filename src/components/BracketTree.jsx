import { useRef, useEffect, useState } from 'react'
import { buildDisplayRounds } from '../bracket.js'
import './BracketTree.css'

const N_COLS = 7
const N_HALF = 4
const CARD_H = 68
const UNIT_H = 92   // height per R16 slot within a 4-game half
const TOTAL_H = N_HALF * UNIT_H

// Column header labels left→right
const HEADERS = ['R16', 'QF', 'SF', 'Final', 'SF', 'QF', 'R16']

// Y center for matchup (localRound, localIdx) within a 4-game half
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

  // All layout values derived from available width
  const COL_W = availW > 0 ? availW / N_COLS : 160
  const CARD_W = COL_W * 0.80
  const COL_GAP = COL_W - CARD_W    // 20% of column width

  function colX(col) { return col * COL_W }

  const display = buildDisplayRounds(rounds, 4)
  const leftHalf  = [display[0].slice(0, 4), display[1].slice(0, 2), display[2].slice(0, 1)]
  const rightHalf = [display[0].slice(4, 8), display[1].slice(2, 4), display[2].slice(1, 2)]
  const final     = display[3][0]

  // Build SVG connector lines
  const lines = []
  const accent = '#f97316', dim = '#252525'

  function addLines(lr, pi, side) {
    const isLeft = side === 'left'
    const halfData = isLeft ? leftHalf : rightHalf
    const c1 = 2 * pi, c2 = 2 * pi + 1
    const y1 = cy(lr - 1, c1), y2 = cy(lr - 1, c2), yp = cy(lr, pi)
    const child1Won = halfData[lr - 1][c1]?.winner != null
    const child2Won = halfData[lr - 1][c2]?.winner != null
    const bothWon   = child1Won && child2Won

    let cx, px, mx
    if (isLeft) {
      const childCol  = lr - 1
      const parentCol = lr
      cx = colX(childCol) + CARD_W
      px = colX(parentCol)
      mx = cx + COL_GAP / 2
    } else {
      // right side: cards are at cols 6, 5, 4 for lr=0,1,2
      const childCol  = 6 - (lr - 1)
      const parentCol = 6 - lr
      cx = colX(childCol)          // left edge of child card
      px = colX(parentCol) + CARD_W  // right edge of parent card
      mx = px + COL_GAP / 2
    }

    const k = `${side}-${lr}-${pi}`
    const sw = (on) => ({ stroke: on ? accent : dim, strokeWidth: on ? 2 : 1.5 })
    lines.push(
      <line key={`${k}-h1`} x1={cx} y1={y1} x2={mx} y2={y1} {...sw(child1Won)} />,
      <line key={`${k}-h2`} x1={cx} y1={y2} x2={mx} y2={y2} {...sw(child2Won)} />,
      <line key={`${k}-v`}  x1={mx} y1={y1} x2={mx} y2={y2} {...sw(bothWon)} />,
      <line key={`${k}-p`}  x1={mx} y1={yp} x2={px} y2={yp} {...sw(bothWon)} />,
    )
  }

  for (let lr = 1; lr <= 2; lr++) {
    for (let pi = 0; pi < leftHalf[lr].length; pi++)  addLines(lr, pi, 'left')
    for (let pi = 0; pi < rightHalf[lr].length; pi++) addLines(lr, pi, 'right')
  }

  // SF → Championship connections (straight horizontal lines)
  const sfCY = cy(2, 0)
  const sfLRightX  = colX(2) + CARD_W
  const sfRLeftX   = colX(4)
  const finalLeftX = colX(3)
  const finalRightX = colX(3) + CARD_W
  const sfLWon = leftHalf[2][0]?.winner != null
  const sfRWon = rightHalf[2][0]?.winner != null
  lines.push(
    <line key="F-L" x1={sfLRightX}  y1={sfCY} x2={finalLeftX}  y2={sfCY} stroke={sfLWon ? accent : dim} strokeWidth={sfLWon ? 2 : 1.5} />,
    <line key="F-R" x1={sfRLeftX}   y1={sfCY} x2={finalRightX} y2={sfCY} stroke={sfRWon ? accent : dim} strokeWidth={sfRWon ? 2 : 1.5} />,
  )

  // Build cards
  const cards = []

  leftHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const r = lr, i = li
      const key = `${r}-${i}`
      cards.push(<Card key={key} matchup={matchup} x={colX(lr)} y={cardTop(lr, li)}
        w={CARD_W} h={CARD_H} highlighted={key === focusedKey} active={r === activeRound} />)
    })
  })

  rightHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const r = lr, i = li + (lr === 0 ? 4 : lr === 1 ? 2 : 1)
      const key = `${r}-${i}`
      const col = 6 - lr
      cards.push(<Card key={key} matchup={matchup} x={colX(col)} y={cardTop(lr, li)}
        w={CARD_W} h={CARD_H} highlighted={key === focusedKey} active={r === activeRound} />)
    })
  })

  cards.push(<Card key="3-0" matchup={final} x={colX(3)} y={cardTop(2, 0)}
    w={CARD_W} h={CARD_H} highlighted={'3-0' === focusedKey} active={activeRound === 3} isFinal />)

  return (
    <div ref={outerRef} className="bt-outer">
      {/* Column headers */}
      {availW > 0 && (
        <div className="bt-headers" style={{ height: 28 }}>
          {HEADERS.map((label, col) => (
            <div key={col} className="bt-header" style={{ left: colX(col), width: CARD_W }}>
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Bracket area */}
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
  const won = winner && food && winner.id === food.id
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
