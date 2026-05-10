import BrandLogo from './BrandLogo.jsx'
import './FaceOff.css'

const ROUND_NAMES = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Championship']

export default function FaceOff({ rounds, activeRound, focusedIdx, onPick, onNav }) {
  const round = rounds[activeRound]
  const total = round.length
  const matchup = round[focusedIdx]
  if (!matchup) return null

  const { top, bottom, winner } = matchup
  const roundName = ROUND_NAMES[activeRound] ?? `Round ${activeRound + 1}`

  return (
    <div className="faceoff">
      <div className="fo-nav">
        <span className="fo-meta">{roundName}<br />Game {focusedIdx + 1} of {total}</span>
      </div>

      <div className="fo-matchup">
        <FoodBtn food={top}    winner={winner} onClick={() => !winner && onPick(activeRound, focusedIdx, top)} />
        <span className="fo-vs">VS</span>
        <FoodBtn food={bottom} winner={winner} onClick={() => !winner && onPick(activeRound, focusedIdx, bottom)} />
      </div>

      {winner && (
        <div className="fo-picked">
          <BrandLogo food={winner} size={14} /> {winner.name} advances →
        </div>
      )}
    </div>
  )
}

function FoodBtn({ food, winner, onClick }) {
  const won  = winner?.id === food?.id
  const lost = winner && !won
  return (
    <button
      className={`fo-btn ${won ? 'won' : ''} ${lost ? 'lost' : ''}`}
      onClick={onClick}
      disabled={!!winner}
    >
      <BrandLogo food={food} size={40} />
      <span className="fo-name">{food.name}</span>
    </button>
  )
}
