import { useState } from 'react'
import './BrandLogo.css'

// Renders a brand logo from Clearbit in a fixed square slot.
// Falls back to the food's emoji if the request fails or no domain is set.
export default function BrandLogo({ food, size }) {
  const [errored, setErrored] = useState(false)
  const slot = { width: size, height: size }

  if (!food) return null
  if (errored || !food.domain) {
    return (
      <span className="brand-logo brand-logo--fallback" style={{ ...slot, fontSize: Math.round(size * 0.85) }}>
        {food.emoji}
      </span>
    )
  }
  return (
    <img
      className="brand-logo"
      style={slot}
      src={`/logos/${food.domain}.png`}
      alt={food.name}
      onError={() => setErrored(true)}
    />
  )
}
