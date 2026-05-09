import { useState, useRef } from 'react'
import './Setup.css'

const DIVISION_ORDER = ['burger', 'chicken', 'pizza', 'street']
const DIVISION_META = {
  burger:  { name: 'Burger Bracket',      emoji: '🍔' },
  chicken: { name: 'Cluckers Conference', emoji: '🍗' },
  pizza:   { name: 'The Sauce District',  emoji: '🍕' },
  street:  { name: 'Street Eats Region',  emoji: '🌮' },
}

function initDivisions(foods) {
  const d = { burger: [], chicken: [], pizza: [], street: [] }
  foods.forEach(f => d[f.division].push({ ...f }))
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

  // Global seed offset: burger 1-8, chicken 9-16, pizza 17-24, street 25-32
  function seedOffset(div) {
    return DIVISION_ORDER.indexOf(div) * 8
  }

  function handleStart() {
    const ranked = DIVISION_ORDER
      .flatMap(div => divisions[div])
      .map((f, i) => ({ ...f, seed: i + 1 }))
    onStart(ranked)
  }

  return (
    <div className="setup">
      <div className="setup-hero">
        <h2 className="setup-headline">Pick Your Dinner</h2>
        <p className="setup-tagline">32 contenders · 4 divisions · one winner · drag to seed · click to rename</p>
      </div>

      <div className="divisions-grid">
        {DIVISION_ORDER.map(div => {
          const { name, emoji } = DIVISION_META[div]
          const offset = seedOffset(div)
          const foods = divisions[div]

          return (
            <div
              key={div}
              className="division-section"
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
                    <span className="seed">{offset + i + 1}</span>
                    <span className="food-emoji">{food.emoji}</span>
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
        Seed Your Bracket →
      </button>
    </div>
  )
}
