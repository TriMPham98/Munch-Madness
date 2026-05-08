import { useState, useEffect, useRef, useCallback } from 'react'
import { DEFAULT_FOODS, buildInitialBracket, pickWinner, autoPickRemainder } from './bracket.js'
import Setup from './components/Setup.jsx'
import BracketTree from './components/BracketTree.jsx'
import ShotClock from './components/ShotClock.jsx'
import FaceOff from './components/FaceOff.jsx'
import Winner from './components/Winner.jsx'
import './App.css'

const SHOT_SECS = 24

export default function App() {
  const [screen, setScreen] = useState('setup')
  const [rounds, setRounds] = useState(null)
  const [shotSecs, setShotSecs] = useState(SHOT_SECS)
  const [buzzer, setBuzzer] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const roundsLenRef = useRef(0)

  const activeRound = rounds ? rounds.length - 1 : 0

  // Reset clock + focus when new round unlocks
  useEffect(() => {
    if (!rounds) return
    if (rounds.length !== roundsLenRef.current) {
      roundsLenRef.current = rounds.length
      setShotSecs(SHOT_SECS)
      const first = rounds[rounds.length - 1].findIndex(m => !m.winner)
      setFocusedIdx(first === -1 ? 0 : first)
    }
  }, [rounds?.length])

  const handleTimeUp = useCallback(() => {
    if (!rounds) return
    setBuzzer(true)
    setTimeout(() => setBuzzer(false), 1200)
    const updated = autoPickRemainder(rounds, activeRound)
    setRounds(updated)
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner) setTimeout(() => setScreen('winner'), 1400)
  }, [rounds, activeRound])

  useEffect(() => {
    if (screen !== 'bracket') return
    if (shotSecs <= 0) { handleTimeUp(); return }
    const id = setTimeout(() => setShotSecs(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [shotSecs, screen, handleTimeUp])

  function handleStart(foods) {
    const bracket = buildInitialBracket(foods)
    setRounds(bracket)
    roundsLenRef.current = 1
    setShotSecs(SHOT_SECS)
    setFocusedIdx(0)
    setScreen('bracket')
  }

  function handlePick(roundIndex, matchupIndex, food) {
    const updated = pickWinner(rounds, roundIndex, matchupIndex, food)
    setRounds(updated)
    // Advance focus to next unpicked
    const next = updated[roundIndex].findIndex((m, i) => i > matchupIndex && !m.winner)
    setFocusedIdx(next !== -1 ? next : matchupIndex)
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner) setTimeout(() => setScreen('winner'), 600)
  }

  function handleNav(dir) {
    if (!rounds) return
    const len = rounds[activeRound].length
    setFocusedIdx(i => Math.max(0, Math.min(len - 1, i + dir)))
  }

  function handleReset() {
    setScreen('setup')
    setRounds(null)
    setShotSecs(SHOT_SECS)
    setFocusedIdx(0)
    roundsLenRef.current = 0
  }

  const champion = rounds?.[rounds.length - 1]?.[0]?.winner
  const focusedKey = rounds ? `${activeRound}-${focusedIdx}` : null

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
            <div className="bar-divider" />
            <FaceOff
              rounds={rounds}
              activeRound={activeRound}
              focusedIdx={focusedIdx}
              onPick={handlePick}
              onNav={handleNav}
            />
            <button className="reset-btn" onClick={handleReset}>↩</button>
          </div>
          <BracketTree
            rounds={rounds}
            activeRound={activeRound}
            focusedKey={focusedKey}
          />
        </>
      )}

      {screen === 'winner' && <Winner food={champion} onReset={handleReset} />}
    </div>
  )
}
