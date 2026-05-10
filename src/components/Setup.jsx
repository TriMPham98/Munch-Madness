import { useState, useRef } from 'react'
import { DIVISIONS } from '../bracket.js'
import BrandLogo from './BrandLogo.jsx'
import './Setup.css'

const DIVISION_ORDER = DIVISIONS.map(d => d.key)
const DIVISION_META = Object.fromEntries(DIVISIONS.map(d => [d.key, d]))

function initDivisions(foods) {
  const d = Object.fromEntries(DIVISION_ORDER.map(k => [k, []]))
  foods.forEach(f => d[f.division]?.push({ ...f }))
  return d
}

export default function Setup({ foods, onStart }) {
  const [divisions, setDivisions] = useState(() => initDivisions(foods))
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [overInfo, setOverInfo] = useState(null) // { div, idx }
  const drag = useRef(null) // { food, fromDiv }

  function startEdit(food) {
    setEditingId(food.id)
    setEditValue(food.name)
  }

  function commitEdit(id) {
    setDivisions(prev => {
      const next = {}
      for (const div of DIVISION_ORDER) {
        next[div] = prev[div].map(f => f.id === id ? { ...f, name: editValue.trim() || f.name } : f)
      }
      return next
    })
    setEditingId(null)
  }

  function handleKey(e, id) {
    if (e.key === 'Enter') commitEdit(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  function onDragStart(e, food, fromDiv) {
    drag.current = { food, fromDiv }
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2)
  }

  function onDragOver(e, div, idx) {
    if (drag.current?.fromDiv !== div) return // no cross-division drops
    e.preventDefault()
    setOverInfo({ div, idx })
  }

  function onDrop(e, div) {
    e.preventDefault()
    if (!drag.current || drag.current.fromDiv !== div) return
    const { food } = drag.current
    const insertAt = overInfo?.div === div ? overInfo.idx : divisions[div].length

    setDivisions(prev => {
      const list = prev[div].filter(f => f.id !== food.id)
      const oldIdx = prev[div].findIndex(f => f.id === food.id)
      const adjusted = insertAt > oldIdx ? insertAt - 1 : insertAt
      list.splice(Math.min(adjusted, list.length), 0, food)
      return { ...prev, [div]: list }
    })

    drag.current = null
    setOverInfo(null)
  }

  function onDragEnd() {
    drag.current = null
    setOverInfo(null)
  }

  function handleStart() {
    // Pass foods grouped by division, in the user's chosen order. bracket.js
    // assigns within-division seeds (1-8) and packs each division into a quarter.
    const ranked = DIVISION_ORDER.flatMap(div => divisions[div])
    onStart(ranked)
  }

  return (
    <div className="setup">
      <div className="setup-hero">
        <h2 className="setup-headline">Pick Your Dinner</h2>
        <p className="setup-tagline">32 contenders · 4 divisions · seed 1–8 within each · drag to reorder · click to rename</p>
      </div>

      <div className="divisions-grid">
        {DIVISION_ORDER.map(div => {
          const { name, emoji, color } = DIVISION_META[div]
          const foods = divisions[div]

          return (
            <div
              key={div}
              className="division-section"
              style={{ '--div-color': color }}
              onDragOver={e => { if (drag.current?.fromDiv === div) e.preventDefault() }}
              onDrop={e => onDrop(e, div)}
            >
              <div className="division-header">
                <span className="division-emoji">{emoji}</span>
                <span className="division-name">{name}</span>
              </div>
              <div className="food-grid">
                {foods.map((food, i) => (
                  <div
                    key={food.id}
                    className={`food-card ${overInfo?.div === div && overInfo.idx === i ? 'drag-over' : ''}`}
                    draggable={editingId !== food.id}
                    onDragStart={e => onDragStart(e, food, div)}
                    onDragOver={e => onDragOver(e, div, i)}
                    onDragEnd={onDragEnd}
                  >
                    <span className="seed">{i + 1}</span>
                    <BrandLogo food={food} size={24} />
                    {editingId === food.id ? (
                      <input
                        className="food-name-input"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(food.id)}
                        onKeyDown={e => handleKey(e, food.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="food-name" onClick={() => startEdit(food)}>{food.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <button className="start-btn" onClick={handleStart}>
        Start the Bracket →
      </button>
    </div>
  )
}
