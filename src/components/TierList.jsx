import { useState, useRef } from 'react'
import './TierList.css'

const TIER_KEYS = ['S', 'A', 'B', 'C', 'D']
const TIER_COLORS = { S: '#f59e0b', A: '#94a3b8', B: '#86efac', C: '#fb923c', D: '#818cf8' }

function seedOffset(tiers, tier) {
  let offset = 0
  for (const t of TIER_KEYS) {
    if (t === tier) break
    offset += tiers[t].length
  }
  return offset
}

export default function TierList({ foods, onStart }) {
  // All tiers start empty; unranked pool starts with all foods
  const [tiers, setTiers] = useState({
    S: [], A: [], B: [], C: [], D: [], unranked: [...foods],
  })
  const [overInfo, setOverInfo] = useState(null) // { tier, insertBefore }
  const drag = useRef(null) // { food, fromTier }

  function onDragStart(e, food, fromTier) {
    drag.current = { food, fromTier }
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2)
  }

  function onChipDragOver(e, tier, chipIndex) {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const insertBefore = e.clientX < rect.left + rect.width / 2 ? chipIndex : chipIndex + 1
    setOverInfo({ tier, insertBefore })
  }

  function onLaneDragOver(e, tier) {
    e.preventDefault()
    if (!overInfo || overInfo.tier !== tier) {
      setOverInfo({ tier, insertBefore: tiers[tier].length })
    }
  }

  function onDrop(e, tier) {
    e.preventDefault()
    if (!drag.current) return
    const { food, fromTier } = drag.current
    const insertBefore = overInfo?.tier === tier ? overInfo.insertBefore : tiers[tier].length

    setTiers(prev => {
      const fromList = prev[fromTier].filter(f => f.id !== food.id)
      if (fromTier === tier) {
        const oldIdx = prev[tier].findIndex(f => f.id === food.id)
        const adjusted = insertBefore > oldIdx ? insertBefore - 1 : insertBefore
        const reordered = [...fromList]
        reordered.splice(Math.min(adjusted, reordered.length), 0, food)
        return { ...prev, [tier]: reordered }
      }
      const toList = [...prev[tier]]
      toList.splice(Math.min(insertBefore, toList.length), 0, food)
      return { ...prev, [fromTier]: fromList, [tier]: toList }
    })

    drag.current = null
    setOverInfo(null)
  }

  function onDragEnd() {
    drag.current = null
    setOverInfo(null)
  }

  function handleStart() {
    const ranked = TIER_KEYS.flatMap(t => tiers[t])
    const all = [...ranked, ...tiers.unranked].map((f, i) => ({ ...f, seed: i + 1 }))
    onStart(all)
  }

  function handleSkip() {
    onStart(foods.map((f, i) => ({ ...f, seed: i + 1 })))
  }

  function renderChips(tier, chips, showSeed) {
    const offset = showSeed ? seedOffset(tiers, tier) : null
    const items = []
    chips.forEach((food, ci) => {
      if (overInfo?.tier === tier && overInfo.insertBefore === ci) {
        items.push(<div key={`ind-${ci}`} className="tl-insert-line" />)
      }
      items.push(
        <div
          key={food.id}
          className="tl-chip"
          draggable
          onDragStart={e => onDragStart(e, food, tier)}
          onDragOver={e => onChipDragOver(e, tier, ci)}
          onDragEnd={onDragEnd}
        >
          {showSeed && <span className="tl-chip-seed">{offset + ci + 1}</span>}
          <span className="tl-chip-emoji">{food.emoji}</span>
          <span className="tl-chip-name">{food.name}</span>
        </div>
      )
    })
    if (overInfo?.tier === tier && overInfo.insertBefore === chips.length) {
      items.push(<div key="ind-end" className="tl-insert-line" />)
    }
    return items
  }

  return (
    <div className="tl-wrap">
      <h2 className="tl-title">Seed Your Bracket</h2>
      <p className="tl-sub">Drag foods into tiers to set seeds — S earns seed #1, D gets the last seeds. Order within each tier matters.</p>

      <div className="tl-board">
        {TIER_KEYS.map(tier => {
          const color  = TIER_COLORS[tier]
          const isOver = overInfo?.tier === tier
          const chips  = tiers[tier]
          return (
            <div
              key={tier}
              className={`tl-row ${isOver ? 'dragover' : ''}`}
              style={{ '--tier-color': color }}
              onDragOver={e => onLaneDragOver(e, tier)}
              onDrop={e => onDrop(e, tier)}
            >
              <div className="tl-label">{tier}</div>
              <div className="tl-chips">
                {renderChips(tier, chips, true)}
                {chips.length === 0 && <span className="tl-empty">drop here</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className={`tl-pool ${overInfo?.tier === 'unranked' ? 'dragover' : ''}`}
        onDragOver={e => onLaneDragOver(e, 'unranked')}
        onDrop={e => onDrop(e, 'unranked')}
      >
        <span className="tl-pool-label">Unranked</span>
        <div className="tl-chips">
          {renderChips('unranked', tiers.unranked, false)}
          {tiers.unranked.length === 0 && <span className="tl-empty">all foods ranked!</span>}
        </div>
      </div>

      <div className="tl-actions">
        <button className="tl-start-btn" onClick={handleStart}>Start the Bracket</button>
        <button className="tl-skip-btn" onClick={handleSkip}>Skip — use defaults</button>
      </div>
    </div>
  )
}
