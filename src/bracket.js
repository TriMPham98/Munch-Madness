export const DEFAULT_FOODS = [
  { id: 1, name: 'Pizza', emoji: '🍕' },
  { id: 2, name: 'Tacos', emoji: '🌮' },
  { id: 3, name: 'Sushi', emoji: '🍣' },
  { id: 4, name: 'Burgers', emoji: '🍔' },
  { id: 5, name: 'Ramen', emoji: '🍜' },
  { id: 6, name: 'Pasta', emoji: '🍝' },
  { id: 7, name: 'Fried Chicken', emoji: '🍗' },
  { id: 8, name: 'Steak', emoji: '🥩' },
  { id: 9, name: 'Burritos', emoji: '🌯' },
  { id: 10, name: 'Pad Thai', emoji: '🍲' },
  { id: 11, name: 'BBQ Ribs', emoji: '🍖' },
  { id: 12, name: 'Poke Bowl', emoji: '🥗' },
  { id: 13, name: 'Dumplings', emoji: '🥟' },
  { id: 14, name: 'Curry', emoji: '🍛' },
  { id: 15, name: 'Sandwiches', emoji: '🥪' },
  { id: 16, name: 'Nachos', emoji: '🧀' },
]

export const ROUND_NAMES = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Championship']
export const SHORT_ROUND_NAMES = ['R16', 'QF', 'SF', 'Final']

// Build initial bracket: pair foods as [1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15]
// Standard March Madness seeding order
const SEED_ORDER = [0, 15, 7, 8, 4, 11, 3, 12, 5, 10, 2, 13, 6, 9, 1, 14]

export function buildInitialBracket(foods) {
  const seeded = SEED_ORDER.map(i => foods[i])
  const matchups = []
  for (let i = 0; i < seeded.length; i += 2) {
    matchups.push({ top: seeded[i], bottom: seeded[i + 1], winner: null })
  }
  return [matchups]
}

export function advanceRound(rounds) {
  const current = rounds[rounds.length - 1]
  const winners = current.map(m => m.winner)
  if (winners.some(w => w === null)) return rounds
  const next = []
  for (let i = 0; i < winners.length; i += 2) {
    next.push({ top: winners[i], bottom: winners[i + 1], winner: null })
  }
  return [...rounds, next]
}

// Returns all 4 display rounds, using TBD placeholders for unplayed rounds
export function buildDisplayRounds(rounds, total = 4) {
  return Array.from({ length: total }, (_, r) => {
    const count = Math.pow(2, total - 1 - r)
    if (rounds[r]) return rounds[r]
    return Array.from({ length: count }, () => ({ top: null, bottom: null, winner: null }))
  })
}

// Auto-fills remaining unpicked matchups in roundIndex with random winners
export function autoPickRemainder(rounds, roundIndex) {
  const updated = rounds.map((round, ri) => {
    if (ri !== roundIndex) return round
    return round.map(m => m.winner ? m : { ...m, winner: Math.random() < 0.5 ? m.top : m.bottom })
  })
  const done = updated[roundIndex].every(m => m.winner)
  if (done && roundIndex === updated.length - 1 && updated[roundIndex].length > 1) {
    return advanceRound(updated)
  }
  return updated
}

export function pickWinner(rounds, roundIndex, matchupIndex, food) {
  const updated = rounds.map((round, ri) => {
    if (ri !== roundIndex) return round
    return round.map((matchup, mi) => {
      if (mi !== matchupIndex) return matchup
      return { ...matchup, winner: food }
    })
  })
  const current = updated[roundIndex]
  const allPicked = current.every(m => m.winner !== null)
  if (allPicked && roundIndex === updated.length - 1 && current.length > 1) {
    return advanceRound(updated)
  }
  return updated
}
