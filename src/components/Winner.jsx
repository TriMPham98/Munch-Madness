import BrandLogo from './BrandLogo.jsx'
import './Winner.css'

export default function Winner({ food, onReset }) {
  return (
    <div className="winner-screen">
      <div className="confetti-bg" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="confetti-piece" style={{ '--i': i }} />
        ))}
      </div>
      <div className="winner-card">
        <div className="trophy">🏆</div>
        <h2>Tonight's Dinner</h2>
        <div className="winner-food">
          <BrandLogo food={food} size={96} />
          <span className="winner-name">{food.name}</span>
        </div>
        <p className="winner-sub">The crowd has spoken. Time to eat!</p>
        <button className="play-again-btn" onClick={onReset}>
          Play Again
        </button>
      </div>
    </div>
  )
}
