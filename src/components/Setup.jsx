import { useState, useRef } from 'react'
import './Setup.css'

export default function Setup({ foods, onStart }) {
  const [items, setItems] = useState(foods.map(f => ({ ...f })))
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [overIdx, setOverIdx] = useState(null)
  const dragIdx = useRef(null)

  function startEdit(food) {
    setEditingId(food.id)
    setEditValue(food.name)
  }

  function commitEdit(id) {
    setItems(prev => prev.map(f => f.id === id ? { ...f, name: editValue.trim() || f.name } : f))
    setEditingId(null)
  }

  function handleKey(e, id) {
    if (e.key === 'Enter') commitEdit(id)
    if (e.key === 'Escape') setEditingId(null)
  }

  function onDragStart(e, idx) {
    dragIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e, idx) {
    e.preventDefault()
    setOverIdx(idx)
  }

  function onDrop(e, idx) {
    e.preventDefault()
    const from = dragIdx.current
    if (from === null || from === idx) { setOverIdx(null); return }
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(idx, 0, moved)
      return next
    })
    dragIdx.current = null
    setOverIdx(null)
  }

  function onDragEnd() {
    dragIdx.current = null
    setOverIdx(null)
  }

  return (
    <div className="setup">
      <h2>Your Contenders</h2>
      <p className="setup-hint">Click a name to rename it. Drag cards to reorder seeds.</p>
      <div className="food-grid">
        {items.map((food, i) => (
          <div
            key={food.id}
            className={`food-card ${overIdx === i ? 'drag-over' : ''}`}
            draggable={editingId !== food.id}
            onDragStart={e => onDragStart(e, i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={e => onDrop(e, i)}
            onDragEnd={onDragEnd}
          >
            <span className="seed">#{i + 1}</span>
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
      <button className="start-btn" onClick={() => onStart(items)}>
        Seed Your Bracket →
      </button>
    </div>
  )
}
