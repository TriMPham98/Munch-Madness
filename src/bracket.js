export const DEFAULT_FOODS = [
  { id: 1,  name: 'Pizza',        emoji: '🍕' },
  { id: 2,  name: 'Tacos',        emoji: '🌮' },
  { id: 3,  name: 'Sushi',        emoji: '🍣' },
  { id: 4,  name: 'Burgers',      emoji: '🍔' },
  { id: 5,  name: 'Ramen',        emoji: '🍜' },
  { id: 6,  name: 'Pasta',        emoji: '🍝' },
  { id: 7,  name: 'Fried Chicken',emoji: '🍗' },
  { id: 8,  name: 'Steak',        emoji: '🥩' },
  { id: 9,  name: 'Burritos',     emoji: '🌯' },
  { id: 10, name: 'Pad Thai',     emoji: '🍲' },
  { id: 11, name: 'BBQ Ribs',     emoji: '🍖' },
  { id: 12, name: 'Poke Bowl',    emoji: '🥗' },
  { id: 13, name: 'Dumplings',    emoji: '🥟' },
  { id: 14, name: 'Curry',        emoji: '🍛' },
  { id: 15, name: 'Sandwiches',   emoji: '🥪' },
  { id: 16, name: 'Nachos',       emoji: '🧀' },
  { id: 17, name: 'Hot Dogs',     emoji: '🌭' },
  { id: 18, name: 'Waffles',      emoji: '🧇' },
  { id: 19, name: 'Lobster',      emoji: '🦞' },
  { id: 20, name: 'Mac & Cheese', emoji: '🫕' },
  { id: 21, name: 'Wings',        emoji: '🐔' },
  { id: 22, name: 'Gyros',        emoji: '🥙' },
  { id: 23, name: 'Falafel',      emoji: '🧆' },
  { id: 24, name: 'Fried Rice',   emoji: '🍚' },
  { id: 25, name: 'Lasagna',      emoji: '🫙' },
  { id: 26, name: 'Fish & Chips', emoji: '🐟' },
  { id: 27, name: 'Pho',          emoji: '🥣' },
  { id: 28, name: 'Shakshuka',    emoji: '🍳' },
  { id: 29, name: 'Quesadilla',   emoji: '🫓' },
  { id: 30, name: 'Paella',       emoji: '🥘' },
  { id: 31, name: 'Risotto',      emoji: '🌾' },
  { id: 32, name: 'Banh Mi',      emoji: '🥖' },
]

export const ROUND_NAMES = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Championship']
export const SHORT_ROUND_NAMES = ['R32', 'R16', 'QF', 'SF', 'Final']

// Standard 32-team bracket seeding: 1v32, 16v17, 8v25, 9v24, 5v28, 12v21, 4v29, 13v20 (left)
//                                    6v27, 11v22, 3v30, 14v19, 7v26, 10v23, 2v31, 15v18 (right)
const SEED_ORDER = [
  0, 31, 15, 16,  7, 24,  8, 23,
  4, 27, 11, 20,  3, 28, 12, 19,
  5, 26, 10, 21,  2, 29, 13, 18,
  6, 25,  9, 22,  1, 30, 14, 17,
]

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

// Returns all 5 display rounds, using TBD placeholders for unplayed rounds
export function buildDisplayRounds(rounds, total = 5) {
  return Array.from({ length: total }, (_, r) => {
    const count = Math.pow(2, total - 1 - r)
    if (rounds[r]) return rounds[r]
    return Array.from({ length: count }, () => ({ top: null, bottom: null, winner: null }))
  })
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

// Auto-picks only the single matchup at matchupIndex with a random winner
export function autoPickOne(rounds, roundIndex, matchupIndex) {
  const matchup = rounds[roundIndex]?.[matchupIndex]
  if (!matchup || matchup.winner) return rounds
  const winner = Math.random() < 0.5 ? matchup.top : matchup.bottom
  return pickWinner(rounds, roundIndex, matchupIndex, winner)
}
