import './Matchup.css'

export default function Matchup({ matchup, onPick }) {
  const { top, bottom, winner } = matchup

  return (
    <div className={`matchup ${winner ? 'decided' : ''}`}>
      <FoodSlot
        food={top}
        isWinner={winner?.id === top.id}
        isLoser={winner && winner.id !== top.id}
        onClick={() => onPick(top)}
      />
      <div className="vs">vs</div>
      <FoodSlot
        food={bottom}
        isWinner={winner?.id === bottom.id}
        isLoser={winner && winner.id !== bottom.id}
        onClick={() => onPick(bottom)}
      />
    </div>
  )
}

function FoodSlot({ food, isWinner, isLoser, onClick }) {
  return (
    <button
      className={`food-slot ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}
      onClick={onClick}
    >
      <span className="slot-emoji">{food.emoji}</span>
      <span className="slot-name">{food.name}</span>
      {isWinner && <span className="winner-badge">✓</span>}
    </button>
  )
}
