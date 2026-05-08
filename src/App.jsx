import { useState, useEffect, useRef, useCallback } from 'react'
import { DEFAULT_FOODS, buildInitialBracket, pickWinner, autoPickRemainder } from './bracket.js'
import Setup from './components/Setup.jsx'
import BracketTree from './components/BracketTree.jsx'
import ShotClock from './components/ShotClock.jsx'
import Winner from './components/Winner.jsx'
import './App.css'

const SHOT_SECS = 24

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [rounds, setRounds] = useState(null)
  const [shotSecs, setShotSecs] = useState(SHOT_SECS)
  const [buzzer, setBuzzer] = useState(false)
  const roundsLenRef = useRef(0)

  const activeRound = rounds ? rounds.length - 1 : 0

  // Reset shot clock when a new round starts
  useEffect(() => {
    if (!rounds) return
    if (rounds.length !== roundsLenRef.current) {
      roundsLenRef.current = rounds.length
      setShotSecs(SHOT_SECS)
    }
  }, [rounds?.length])

  const handleTimeUp = useCallback(() => {
    if (!rounds) return
    setBuzzer(true)
    setTimeout(() => setBuzzer(false), 1200)
    const updated = autoPickRemainder(rounds, activeRound)
    setRounds(updated)
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner) {
      setTimeout(() => setScreen('winner'), 1400)
    }
  }, [rounds, activeRound])

  // Countdown tick
  useEffect(() => {
    if (screen !== 'bracket') return
    if (shotSecs <= 0) {
      handleTimeUp()
      return
    }
    const id = setTimeout(() => setShotSecs(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [shotSecs, screen, handleTimeUp])

  function handleStart(foods) {
    const bracket = buildInitialBracket(foods)
    setRounds(bracket)
    roundsLenRef.current = 1
    setShotSecs(SHOT_SECS)
    setScreen('bracket')
  }

  function handlePick(roundIndex, matchupIndex, food) {
    const updated = pickWinner(rounds, roundIndex, matchupIndex, food)
    setRounds(updated)
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner) {
      setTimeout(() => setScreen('winner'), 600)
    }
  }

  function handleReset() {
    setScreen('setup')
    setRounds(null)
    setShotSecs(SHOT_SECS)
    roundsLenRef.current = 0
  }

  const champion = rounds?.[rounds.length - 1]?.[0]?.winner

  return (
    <div className="app">
      {buzzer && <div className="buzzer-flash">BUZZER! 🚨</div>}

      <header className="app-header">
        <h1>🏆 Munch Madness</h1>
        <p className="tagline">March Madness — for dinner</p>
      </header>

      {screen === 'setup' && <Setup foods={DEFAULT_FOODS} onStart={handleStart} />}

      {screen === 'bracket' && rounds && (
        <>
          <div className="bracket-bar">
            <ShotClock seconds={shotSecs} />
            <div className="round-info">
              <span className="round-label">
                {['Round of 16', 'Quarterfinals', 'Semifinals', 'Championship'][activeRound]}
              </span>
              <span className="picks-left">
                {rounds[activeRound].filter(m => !m.winner).length} picks left
              </span>
            </div>
            <button className="reset-btn" onClick={handleReset}>↩ Start Over</button>
          </div>
          <BracketTree rounds={rounds} onPick={handlePick} activeRound={activeRound} />
        </>
      )}

      {screen === 'winner' && <Winner food={champion} onReset={handleReset} />}
    </div>
  )
}
