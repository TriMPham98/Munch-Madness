import { useState } from 'react'
import './Setup.css'

export default function Setup({ foods, onStart }) {
  const [items, setItems] = useState(foods.map(f => ({ ...f })))
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

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

  return (
    <div className="setup">
      <h2>Your Contenders</h2>
      <p className="setup-hint">Click any food name to rename it, then hit Start when you're ready.</p>
      <div className="food-grid">
        {items.map((food, i) => (
          <div key={food.id} className="food-card">
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
        Start the Bracket
      </button>
    </div>
  )
}
