import { useState, useEffect, useRef, useCallback } from 'react'
import { DEFAULT_FOODS, buildInitialBracket, pickWinner, autoPickOne, ROUND_NAMES } from './bracket.js'

const STORAGE_KEY = 'munch-madness-v1'
const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
import Setup from './components/Setup.jsx'
import TierList from './components/TierList.jsx'
import BracketTree from './components/BracketTree.jsx'
import ShotClock from './components/ShotClock.jsx'
import FaceOff from './components/FaceOff.jsx'
import Winner from './components/Winner.jsx'
import './App.css'

const SHOT_SECS = 24

const buzzerAudio = new Audio('/basketballBuzzer.mp3')
const tickAudio   = new Audio('/clockTick.mp3')

function playBuzzer() {
  buzzerAudio.currentTime = 0
  buzzerAudio.play().catch(() => {})
}

function playTick() {
  tickAudio.currentTime = 0
  tickAudio.play().catch(() => {})
}

export default function App() {
  const [screen,     setScreen]     = useState(() => load()?.screen     ?? 'setup')
  const [setupFoods, setSetupFoods] = useState(() => load()?.setupFoods ?? null)
  const [rounds,     setRounds]     = useState(() => load()?.rounds     ?? null)
  const [focusedIdx, setFocusedIdx] = useState(() => load()?.focusedIdx ?? 0)
  const [shotSecs,   setShotSecs]   = useState(SHOT_SECS)
  const [buzzer,     setBuzzer]     = useState(false)
  const [transitionRound, setTransitionRound] = useState(null)
  const roundsLenRef = useRef(load()?.rounds?.length ?? 0)

  const activeRound = rounds ? rounds.length - 1 : 0

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, rounds, setupFoods, focusedIdx }))
  }, [screen, rounds, setupFoods, focusedIdx])

  // Reset clock + focus when new round unlocks; show transition splash for round 2+
  useEffect(() => {
    if (!rounds) return
    if (rounds.length !== roundsLenRef.current) {
      roundsLenRef.current = rounds.length
      setShotSecs(SHOT_SECS)
      const first = rounds[rounds.length - 1].findIndex(m => !m.winner)
      setFocusedIdx(first === -1 ? 0 : first)
      if (rounds.length > 1) {
        const name = ROUND_NAMES[rounds.length - 1] ?? `Round ${rounds.length}`
        setTransitionRound(name)
        setTimeout(() => setTransitionRound(null), 2000)
      }
    }
  }, [rounds?.length])

  const handleTimeUp = useCallback(() => {
    if (!rounds) return
    playBuzzer()
    setBuzzer(true)
    setTimeout(() => setBuzzer(false), 1200)
    const updated = autoPickOne(rounds, activeRound, focusedIdx)
    setRounds(updated)
    setShotSecs(SHOT_SECS)
    const next = updated[activeRound].findIndex((m, i) => i > focusedIdx && !m.winner)
    setFocusedIdx(next !== -1 ? next : focusedIdx)
    const last = updated[updated.length - 1]
    if (last.length === 1 && last[0].winner) setTimeout(() => setScreen('winner'), 1400)
  }, [rounds, activeRound, focusedIdx])

  useEffect(() => {
    if (screen !== 'bracket' || transitionRound) return
    if (shotSecs <= 0) { handleTimeUp(); return }
    playTick()
    const id = setTimeout(() => setShotSecs(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [shotSecs, screen, transitionRound, handleTimeUp])

  function handleSetupDone(foods) {
    setSetupFoods(foods)
    setScreen('seeding')
  }

  function handleStart(rankedFoods) {
    const bracket = buildInitialBracket(rankedFoods)
    setRounds(bracket)
    roundsLenRef.current = 1
    setShotSecs(SHOT_SECS)
    setFocusedIdx(0)
    setScreen('bracket')
  }

  function handlePick(roundIndex, matchupIndex, food) {
    const updated = pickWinner(rounds, roundIndex, matchupIndex, food)
    setRounds(updated)
    setShotSecs(SHOT_SECS)  // reset clock after every pick
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
    localStorage.removeItem(STORAGE_KEY)
    setScreen('setup')
    setSetupFoods(null)
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

      {transitionRound && (
        <div className="round-transition">
          <span className="rt-label">Next up</span>
          <div className="rt-name">{transitionRound}</div>
        </div>
      )}

      <header className="app-header">
        <h1>🏆 Munch Madness</h1>
        <p className="tagline">March Madness — for dinner</p>
      </header>

      {screen === 'setup' && <Setup foods={DEFAULT_FOODS} onStart={handleSetupDone} />}

      {screen === 'seeding' && setupFoods && (
        <TierList foods={setupFoods} onStart={handleStart} />
      )}

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
