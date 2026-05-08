import { useState } from 'react'
import { DEFAULT_FOODS, ROUND_NAMES, buildInitialBracket, pickWinner } from './bracket.js'
import Setup from './components/Setup.jsx'
import Bracket from './components/Bracket.jsx'
import Winner from './components/Winner.jsx'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('setup') // 'setup' | 'bracket' | 'winner'
  const [foods, setFoods] = useState(DEFAULT_FOODS)
  const [rounds, setRounds] = useState(null)
  const [activeRound, setActiveRound] = useState(0)

  function handleStart(selectedFoods) {
    const bracket = buildInitialBracket(selectedFoods)
    setFoods(selectedFoods)
    setRounds(bracket)
    setActiveRound(0)
    setScreen('bracket')
  }

  function handlePick(roundIndex, matchupIndex, food) {
    const updated = pickWinner(rounds, roundIndex, matchupIndex, food)
    setRounds(updated)

    // If a new round was added, switch to it
    if (updated.length > rounds.length) {
      const nextRound = updated.length - 1
      // Check if this is the championship final (1 matchup)
      if (updated[nextRound].length === 1 && updated[nextRound - 1].length === 2) {
        setActiveRound(nextRound)
      } else {
        setActiveRound(nextRound)
      }
    }

    // Check for overall winner: last round has 1 matchup with a winner
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner !== null) {
      setTimeout(() => setScreen('winner'), 600)
    }
  }

  function handleReset() {
    setScreen('setup')
    setRounds(null)
    setActiveRound(0)
  }

  const champion = rounds && rounds[rounds.length - 1]?.[0]?.winner

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏆 Munch Madness</h1>
        <p className="tagline">March Madness — for dinner</p>
      </header>

      {screen === 'setup' && <Setup foods={foods} onStart={handleStart} />}
      {screen === 'bracket' && rounds && (
        <Bracket
          rounds={rounds}
          activeRound={activeRound}
          onPick={handlePick}
          onRoundSelect={setActiveRound}
          onReset={handleReset}
        />
      )}
      {screen === 'winner' && <Winner food={champion} onReset={handleReset} />}
    </div>
  )
}
