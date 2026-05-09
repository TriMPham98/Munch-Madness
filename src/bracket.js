export const DEFAULT_FOODS = [
  { id: 1,  name: "In-N-Out",          emoji: '🍔' },
  { id: 2,  name: "Chick-fil-A",       emoji: '🐔' },
  { id: 3,  name: "Chipotle",          emoji: '🌯' },
  { id: 4,  name: "Shake Shack",       emoji: '🍔' },
  { id: 5,  name: "Popeyes",           emoji: '🍗' },
  { id: 6,  name: "Raising Cane's",    emoji: '🍗' },
  { id: 7,  name: "McDonald's",        emoji: '🍟' },
  { id: 8,  name: "Taco Bell",         emoji: '🌮' },
  { id: 9,  name: "Five Guys",         emoji: '🍔' },
  { id: 10, name: "Domino's",          emoji: '🍕' },
  { id: 11, name: "Wendy's",           emoji: '🍔' },
  { id: 12, name: "Wingstop",          emoji: '🍗' },
  { id: 13, name: "KFC",               emoji: '🍗' },
  { id: 14, name: "Olive Garden",      emoji: '🍝' },
  { id: 15, name: "Burger King",       emoji: '🍔' },
  { id: 16, name: "Pizza Hut",         emoji: '🍕' },
  { id: 17, name: "Buffalo Wild Wings",emoji: '🍺' },
  { id: 18, name: "Cheesecake Factory",emoji: '🍰' },
  { id: 19, name: "Subway",            emoji: '🥪' },
  { id: 20, name: "Panda Express",     emoji: '🥡' },
  { id: 21, name: "Jersey Mike's",     emoji: '🥪' },
  { id: 22, name: "Whataburger",       emoji: '🍔' },
  { id: 23, name: "Texas Roadhouse",   emoji: '🥩' },
  { id: 24, name: "Panera Bread",      emoji: '🥐' },
  { id: 25, name: "Qdoba",             emoji: '🌯' },
  { id: 26, name: "Jack in the Box",   emoji: '🃏' },
  { id: 27, name: "Culver's",          emoji: '🍔' },
  { id: 28, name: "Papa John's",       emoji: '🍕' },
  { id: 29, name: "Applebee's",        emoji: '🍺' },
  { id: 30, name: "Chili's",           emoji: '🌶️' },
  { id: 31, name: "IHOP",              emoji: '🥞' },
  { id: 32, name: "Waffle House",      emoji: '🧇' },
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
