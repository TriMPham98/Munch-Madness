import { buildDisplayRounds, SHORT_ROUND_NAMES } from '../bracket.js'
import './BracketTree.css'

const UNIT = 90       // height per R16 slot
const CARD_H = 74     // matchup card height
const CARD_W = 180    // matchup card width
const COL_GAP = 48    // space between columns (for SVG lines)
const COL_W = CARD_W + COL_GAP
const TOTAL_ROUNDS = 4
const N_FIRST = 8     // R16 matchup count

// Center Y of matchup (round r, index i) in pixels
function centerY(r, i) {
  return (2 * i + 1) * Math.pow(2, r - 1) * UNIT
}

function cardTop(r, i) {
  return centerY(r, i) - CARD_H / 2
}

function cardLeft(r) {
  return r * COL_W
}

export default function BracketTree({ rounds, onPick, activeRound }) {
  const display = buildDisplayRounds(rounds, TOTAL_ROUNDS)
  const totalW = TOTAL_ROUNDS * COL_W - COL_GAP
  const totalH = N_FIRST * UNIT

  // SVG connector lines
  const lines = []
  for (let r = 1; r < TOTAL_ROUNDS; r++) {
    for (let pi = 0; pi < display[r].length; pi++) {
      const c1 = 2 * pi
      const c2 = 2 * pi + 1
      const y1 = centerY(r - 1, c1)
      const y2 = centerY(r - 1, c2)
      const yp = centerY(r, pi)
      const cx = cardLeft(r - 1) + CARD_W
      const px = cardLeft(r)
      const mx = cx + COL_GAP / 2

      const child1Won = display[r - 1][c1]?.winner !== null
      const child2Won = display[r - 1][c2]?.winner !== null
      const bothWon = child1Won && child2Won
      const accent = '#f97316'
      const dim = '#252525'

      lines.push(
        <line key={`${r}-${pi}-h1`} x1={cx} y1={y1} x2={mx} y2={y1}
          stroke={child1Won ? accent : dim} strokeWidth={child1Won ? 2 : 1.5} />,
        <line key={`${r}-${pi}-h2`} x1={cx} y1={y2} x2={mx} y2={y2}
          stroke={child2Won ? accent : dim} strokeWidth={child2Won ? 2 : 1.5} />,
        <line key={`${r}-${pi}-v`} x1={mx} y1={y1} x2={mx} y2={y2}
          stroke={bothWon ? accent : dim} strokeWidth={bothWon ? 2 : 1.5} />,
        <line key={`${r}-${pi}-p`} x1={mx} y1={yp} x2={px} y2={yp}
          stroke={bothWon ? accent : dim} strokeWidth={bothWon ? 2 : 1.5} />,
      )
    }
  }

  return (
    <div className="bt-scroll">
      {/* Column headers */}
      <div className="bt-headers" style={{ width: totalW }}>
        {SHORT_ROUND_NAMES.map((name, r) => (
          <div key={r} className={`bt-header ${r === activeRound ? 'active' : ''}`}
            style={{ left: cardLeft(r), width: CARD_W }}>
            {name}
          </div>
        ))}
      </div>

      {/* Bracket area */}
      <div className="bt-inner" style={{ width: totalW, height: totalH }}>
        <svg className="bt-svg" width={totalW} height={totalH}>
          {lines}
        </svg>

        {display.flatMap((round, r) =>
          round.map((matchup, i) => {
            const canInteract = r === activeRound
            // Seed numbers: in R16, top is seeded by position
            const topSeed = r === 0 ? i * 2 + 1 : null
            const botSeed = r === 0 ? i * 2 + 2 : null
            const isUpset = matchup.winner && r === 0 && matchup.winner.id === matchup.bottom?.id

            return (
              <div
                key={`${r}-${i}`}
                className={`bt-card ${r === activeRound ? 'current' : r < activeRound ? 'past' : 'future'}`}
                style={{ left: cardLeft(r), top: cardTop(r, i), width: CARD_W, height: CARD_H }}
              >
                {isUpset && <span className="upset-badge">UPSET!</span>}
                <Slot
                  food={matchup.top}
                  winner={matchup.winner}
                  seed={topSeed}
                  onClick={canInteract && matchup.top ? () => onPick(r, i, matchup.top) : null}
                />
                <div className="bt-sep" />
                <Slot
                  food={matchup.bottom}
                  winner={matchup.winner}
                  seed={botSeed}
                  onClick={canInteract && matchup.bottom ? () => onPick(r, i, matchup.bottom) : null}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function Slot({ food, winner, seed, onClick }) {
  const won = winner && food && winner.id === food.id
  const lost = winner && food && winner.id !== food.id

  return (
    <button
      className={`bt-slot ${won ? 'won' : ''} ${lost ? 'lost' : ''} ${!food ? 'tbd' : ''}`}
      onClick={onClick ?? undefined}
      disabled={!onClick}
    >
      {seed !== null && <span className="bt-seed">{seed}</span>}
      {food
        ? <><span className="bt-emoji">{food.emoji}</span><span className="bt-name">{food.name}</span></>
        : <span className="bt-tbd">TBD</span>
      }
      {won && <span className="bt-check">✓</span>}
    </button>
  )
}
