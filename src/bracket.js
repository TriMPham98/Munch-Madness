export const DEFAULT_FOODS = [
  // Burger Bracket
  { id: 1,  name: "In-N-Out",          emoji: '🍔', division: 'burger'  },
  { id: 4,  name: "Shake Shack",       emoji: '🍔', division: 'burger'  },
  { id: 9,  name: "Five Guys",         emoji: '🍔', division: 'burger'  },
  { id: 11, name: "Wendy's",           emoji: '🍔', division: 'burger'  },
  { id: 15, name: "Burger King",       emoji: '🍔', division: 'burger'  },
  { id: 22, name: "Whataburger",       emoji: '🍔', division: 'burger'  },
  { id: 26, name: "Jack in the Box",   emoji: '🃏', division: 'burger'  },
  { id: 27, name: "Culver's",          emoji: '🍔', division: 'burger'  },
  // Cluckers Conference
  { id: 2,  name: "Chick-fil-A",       emoji: '🐔', division: 'chicken' },
  { id: 5,  name: "Popeyes",           emoji: '🍗', division: 'chicken' },
  { id: 6,  name: "Raising Cane's",    emoji: '🍗', division: 'chicken' },
  { id: 7,  name: "McDonald's",        emoji: '🍟', division: 'chicken' },
  { id: 12, name: "Wingstop",          emoji: '🍗', division: 'chicken' },
  { id: 13, name: "KFC",               emoji: '🍗', division: 'chicken' },
  { id: 17, name: "Buffalo Wild Wings",emoji: '🍺', division: 'chicken' },
  { id: 20, name: "Panda Express",     emoji: '🥡', division: 'chicken' },
  // The Sauce District
  { id: 10, name: "Domino's",          emoji: '🍕', division: 'pizza'   },
  { id: 14, name: "Olive Garden",      emoji: '🍝', division: 'pizza'   },
  { id: 16, name: "Pizza Hut",         emoji: '🍕', division: 'pizza'   },
  { id: 18, name: "Cheesecake Factory",emoji: '🍰', division: 'pizza'   },
  { id: 23, name: "Texas Roadhouse",   emoji: '🥩', division: 'pizza'   },
  { id: 28, name: "Papa John's",       emoji: '🍕', division: 'pizza'   },
  { id: 29, name: "Applebee's",        emoji: '🍺', division: 'pizza'   },
  { id: 30, name: "Chili's",           emoji: '🌶️', division: 'pizza'   },
  // Street Eats Region
  { id: 3,  name: "Chipotle",          emoji: '🌯', division: 'street'  },
  { id: 8,  name: "Taco Bell",         emoji: '🌮', division: 'street'  },
  { id: 19, name: "Subway",            emoji: '🥪', division: 'street'  },
  { id: 21, name: "Jersey Mike's",     emoji: '🥪', division: 'street'  },
  { id: 24, name: "Panera Bread",      emoji: '🥐', division: 'street'  },
  { id: 25, name: "Qdoba",             emoji: '🌯', division: 'street'  },
  { id: 31, name: "IHOP",              emoji: '🥞', division: 'street'  },
  { id: 32, name: "Waffle House",      emoji: '🧇', division: 'street'  },
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
