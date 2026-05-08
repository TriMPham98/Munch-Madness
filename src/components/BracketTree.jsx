import { buildDisplayRounds, SHORT_ROUND_NAMES } from '../bracket.js'
import './BracketTree.css'

// Layout constants
const CARD_H = 66
const CARD_W = 132
const COL_GAP = 28
const COL_W = CARD_W + COL_GAP
const UNIT_H = 88       // height per R16 slot within each 4-game half
const N_HALF = 4        // R16 games per half
const TOTAL_COLS = 7    // R16_L QF_L SF_L | Final | SF_R QF_R R16_R

// Y center for a matchup at (localRound, localIdx) within a 4-game half
function cy(localRound, localIdx) {
  return (2 * localIdx + 1) * Math.pow(2, localRound - 1) * UNIT_H
}
// Convenience
function cardTop(localRound, localIdx) { return cy(localRound, localIdx) - CARD_H / 2 }

// Left half: columns 0,1,2 — lines go right
// Right half: columns 4,5,6 — lines go left
// Championship: column 3 (center)
function colX(col) { return col * COL_W }

const TOTAL_W = TOTAL_COLS * COL_W - COL_GAP
const TOTAL_H = N_HALF * UNIT_H

// Column header labels: left side L→R, then center, then right side R→L
const HEADERS = [
  { label: 'R16', col: 0 },
  { label: 'QF',  col: 1 },
  { label: 'SF',  col: 2 },
  { label: 'Final', col: 3 },
  { label: 'SF',  col: 4 },
  { label: 'QF',  col: 5 },
  { label: 'R16', col: 6 },
]

export default function BracketTree({ rounds, activeRound, focusedKey }) {
  const display = buildDisplayRounds(rounds, 4)

  // Split display into left/right halves
  // Left:  display[r][0..3], display[r][0..1], display[r][0]
  // Right: display[r][4..7], display[r][2..3], display[r][1]
  const leftHalf  = [display[0].slice(0, 4), display[1].slice(0, 2), display[2].slice(0, 1)]
  const rightHalf = [display[0].slice(4, 8), display[1].slice(2, 4), display[2].slice(1, 2)]
  const final     = display[3][0]

  // Global (round, index) for each position
  const globalIdx = {
    left:  (lr, li) => ({ r: lr, i: li }),          // round r, matchup i in display[r]
    right: (lr, li) => ({ r: lr, i: li + (lr === 0 ? 4 : lr === 1 ? 2 : 1) }),
    final: () => ({ r: 3, i: 0 }),
  }

  const lines = []

  // Left side connections (lines go →)
  for (let lr = 1; lr <= 2; lr++) {
    const parentCol = lr   // SF=col2, QF=col1
    const childCol  = lr - 1
    for (let pi = 0; pi < leftHalf[lr].length; pi++) {
      const c1 = 2 * pi, c2 = 2 * pi + 1
      const y1 = cy(lr - 1, c1), y2 = cy(lr - 1, c2), yp = cy(lr, pi)
      const cx = colX(childCol) + CARD_W
      const px = colX(parentCol)
      const mx = cx + COL_GAP / 2
      const child1Won = leftHalf[lr - 1][c1]?.winner !== null
      const child2Won = leftHalf[lr - 1][c2]?.winner !== null
      const accent = '#f97316', dim = '#222'
      lines.push(
        <line key={`L${lr}-${pi}-h1`} x1={cx} y1={y1} x2={mx} y2={y1} stroke={child1Won ? accent : dim} strokeWidth={child1Won ? 2 : 1.5} />,
        <line key={`L${lr}-${pi}-h2`} x1={cx} y1={y2} x2={mx} y2={y2} stroke={child2Won ? accent : dim} strokeWidth={child2Won ? 2 : 1.5} />,
        <line key={`L${lr}-${pi}-v`}  x1={mx} y1={y1} x2={mx} y2={y2} stroke={(child1Won && child2Won) ? accent : dim} strokeWidth={(child1Won && child2Won) ? 2 : 1.5} />,
        <line key={`L${lr}-${pi}-p`}  x1={mx} y1={yp} x2={px} y2={yp} stroke={(child1Won && child2Won) ? accent : dim} strokeWidth={(child1Won && child2Won) ? 2 : 1.5} />,
      )
    }
  }

  // Right side connections (lines go ←, from col6→5→4 toward col3)
  for (let lr = 1; lr <= 2; lr++) {
    const childRightCol  = 6 - (lr - 1)  // lr=1→col6, lr=2→col5
    const parentRightCol = 6 - lr         // lr=1→col5, lr=2→col4
    for (let pi = 0; pi < rightHalf[lr].length; pi++) {
      const c1 = 2 * pi, c2 = 2 * pi + 1
      const y1 = cy(lr - 1, c1), y2 = cy(lr - 1, c2), yp = cy(lr, pi)
      // Lines come off the LEFT edge of right-side cards
      const cx = colX(childRightCol)
      const px = colX(parentRightCol) + CARD_W
      const mx = px + COL_GAP / 2
      const child1Won = rightHalf[lr - 1][c1]?.winner !== null
      const child2Won = rightHalf[lr - 1][c2]?.winner !== null
      const accent = '#f97316', dim = '#222'
      lines.push(
        <line key={`R${lr}-${pi}-h1`} x1={cx} y1={y1} x2={mx} y2={y1} stroke={child1Won ? accent : dim} strokeWidth={child1Won ? 2 : 1.5} />,
        <line key={`R${lr}-${pi}-h2`} x1={cx} y1={y2} x2={mx} y2={y2} stroke={child2Won ? accent : dim} strokeWidth={child2Won ? 2 : 1.5} />,
        <line key={`R${lr}-${pi}-v`}  x1={mx} y1={y1} x2={mx} y2={y2} stroke={(child1Won && child2Won) ? accent : dim} strokeWidth={(child1Won && child2Won) ? 2 : 1.5} />,
        <line key={`R${lr}-${pi}-p`}  x1={mx} y1={yp} x2={px} y2={yp} stroke={(child1Won && child2Won) ? accent : dim} strokeWidth={(child1Won && child2Won) ? 2 : 1.5} />,
      )
    }
  }

  // Championship connections: left SF → Final (→) and right SF → Final (←)
  const sfCY = cy(2, 0)
  const sfLRightX = colX(2) + CARD_W
  const finalLeftX = colX(3)
  const sfLWon = leftHalf[2][0]?.winner !== null
  lines.push(
    <line key="F-L" x1={sfLRightX} y1={sfCY} x2={finalLeftX} y2={sfCY}
      stroke={sfLWon ? '#f97316' : '#222'} strokeWidth={sfLWon ? 2 : 1.5} />
  )
  const sfRLeftX = colX(4)
  const finalRightX = colX(3) + CARD_W
  const sfRWon = rightHalf[2][0]?.winner !== null
  lines.push(
    <line key="F-R" x1={sfRLeftX} y1={sfCY} x2={finalRightX} y2={sfCY}
      stroke={sfRWon ? '#f97316' : '#222'} strokeWidth={sfRWon ? 2 : 1.5} />
  )

  // Render all matchup cards
  const cards = []

  // Left half (local rounds 0,1,2 → display cols 0,1,2)
  leftHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const { r, i } = globalIdx.left(lr, li)
      const key = `${r}-${i}`
      cards.push(
        <Card key={key} matchup={matchup}
          x={colX(lr)} y={cardTop(lr, li)}
          highlighted={key === focusedKey}
          active={r === activeRound}
        />
      )
    })
  })

  // Right half (local rounds 0,1,2 → display cols 6,5,4)
  rightHalf.forEach((round, lr) => {
    round.forEach((matchup, li) => {
      const { r, i } = globalIdx.right(lr, li)
      const key = `${r}-${i}`
      const col = 6 - lr
      cards.push(
        <Card key={key} matchup={matchup}
          x={colX(col)} y={cardTop(lr, li)}
          highlighted={key === focusedKey}
          active={r === activeRound}
        />
      )
    })
  })

  // Championship
  const fKey = '3-0'
  cards.push(
    <Card key={fKey} matchup={final}
      x={colX(3)} y={cardTop(2, 0)}
      highlighted={fKey === focusedKey}
      active={activeRound === 3}
      isFinal
    />
  )

  return (
    <div className="bt-scroll">
      {/* Column headers */}
      <div className="bt-headers" style={{ width: TOTAL_W }}>
        {HEADERS.map(({ label, col }) => (
          <div key={col} className="bt-header" style={{ left: colX(col), width: CARD_W }}>
            {label}
          </div>
        ))}
      </div>

      <div className="bt-inner" style={{ width: TOTAL_W, height: TOTAL_H }}>
        <svg className="bt-svg" width={TOTAL_W} height={TOTAL_H}>{lines}</svg>
        {cards}
      </div>
    </div>
  )
}

function Card({ matchup, x, y, highlighted, active, isFinal }) {
  const { top, bottom, winner } = matchup
  const cls = ['bt-card', highlighted ? 'highlighted' : '', active ? 'cur' : '', isFinal ? 'final' : ''].filter(Boolean).join(' ')
  const isUpset = winner && winner.id === bottom?.id

  return (
    <div className={cls} style={{ left: x, top: y, width: CARD_W, height: CARD_H }}>
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
        ? <><span className="bt-emoji">{food.emoji}</span><span className="bt-name">{food.name}</span></>
        : <span className="bt-tbd">TBD</span>
      }
    </div>
  )
}
