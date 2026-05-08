import { ROUND_NAMES } from '../bracket.js'
import Matchup from './Matchup.jsx'
import './Bracket.css'

export default function Bracket({ rounds, activeRound, onPick, onRoundSelect, onReset }) {
  const currentRound = rounds[activeRound]
  const roundName = ROUND_NAMES[activeRound] ?? `Round ${activeRound + 1}`
  const totalRounds = rounds.length

  const allComplete = currentRound.every(m => m.winner !== null)
  const isLastRound = currentRound.length === 1 && allComplete

  return (
    <div className="bracket-view">
      <div className="round-tabs">
        {rounds.map((_, i) => (
          <button
            key={i}
            className={`round-tab ${i === activeRound ? 'active' : ''}`}
            onClick={() => onRoundSelect(i)}
          >
            {ROUND_NAMES[i] ?? `Round ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="round-header">
        <h2>{roundName}</h2>
        <span className="matchup-count">{currentRound.length} matchup{currentRound.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="matchups">
        {currentRound.map((matchup, i) => (
          <Matchup
            key={i}
            matchup={matchup}
            onPick={(food) => onPick(activeRound, i, food)}
          />
        ))}
      </div>

      <div className="bracket-footer">
        <button className="reset-btn" onClick={onReset}>↩ Start Over</button>
        {allComplete && !isLastRound && totalRounds > activeRound + 1 && (
          <button className="next-btn" onClick={() => onRoundSelect(activeRound + 1)}>
            Next Round →
          </button>
        )}
      </div>
    </div>
  )
}
