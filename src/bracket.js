export const DIVISIONS = [
  { key: 'burger',   name: 'Burger Bracket',      emoji: '🍔', color: '#f97316' },
  { key: 'chicken',  name: 'Cluckers Conference', emoji: '🍗', color: '#facc15' },
  { key: 'handheld', name: 'Handheld Heroes',     emoji: '🌮', color: '#22c55e' },
  { key: 'sitdown',  name: 'Sit-Down Showdown',   emoji: '🍝', color: '#a78bfa' },
]

export const DEFAULT_FOODS = [
  // Burger Bracket — true burger chains
  { id: 1,  name: "In-N-Out",          emoji: '🍔', domain: 'in-n-out.com',          division: 'burger'   },
  { id: 2,  name: "Shake Shack",       emoji: '🍔', domain: 'shakeshack.com',        division: 'burger'   },
  { id: 3,  name: "Five Guys",         emoji: '🍔', domain: 'fiveguys.com',          division: 'burger'   },
  { id: 4,  name: "Wendy's",           emoji: '🍔', domain: 'wendys.com',            division: 'burger'   },
  { id: 5,  name: "Burger King",       emoji: '🍔', domain: 'bk.com',                division: 'burger'   },
  { id: 6,  name: "Whataburger",       emoji: '🍔', domain: 'whataburger.com',       division: 'burger'   },
  { id: 7,  name: "McDonald's",        emoji: '🍔', domain: 'mcdonalds.com',         division: 'burger'   },
  { id: 8,  name: "Steak 'n Shake",    emoji: '🍔', domain: 'steaknshake.com',       division: 'burger'   },
  // Cluckers Conference — chicken & wings
  { id: 9,  name: "Chick-fil-A",       emoji: '🐔', domain: 'chick-fil-a.com',       division: 'chicken'  },
  { id: 10, name: "Popeyes",           emoji: '🍗', domain: 'popeyes.com',           division: 'chicken'  },
  { id: 11, name: "Raising Cane's",    emoji: '🍗', domain: 'raisingcanes.com',      division: 'chicken'  },
  { id: 12, name: "KFC",               emoji: '🍗', domain: 'kfc.com',               division: 'chicken'  },
  { id: 13, name: "Wingstop",          emoji: '🍗', domain: 'wingstop.com',          division: 'chicken'  },
  { id: 14, name: "Buffalo Wild Wings",emoji: '🍗', domain: 'buffalowildwings.com',  division: 'chicken'  },
  { id: 15, name: "Jack in the Box",   emoji: '🍔', domain: 'jackinthebox.com',      division: 'chicken'  },
  { id: 16, name: "Panda Express",     emoji: '🥡', domain: 'pandaexpress.com',      division: 'chicken'  },
  // Handheld Heroes — grab-and-go
  { id: 17, name: "Chipotle",          emoji: '🌯', domain: 'chipotle.com',          division: 'handheld' },
  { id: 18, name: "Taco Bell",         emoji: '🌮', domain: 'tacobell.com',          division: 'handheld' },
  { id: 19, name: "Subway",            emoji: '🥪', domain: 'subway.com',            division: 'handheld' },
  { id: 20, name: "Jersey Mike's",     emoji: '🥪', domain: 'jerseymikes.com',       division: 'handheld' },
  { id: 21, name: "Bánh Mì Đức Hương", emoji: '🥖', division: 'handheld' },
  { id: 22, name: "Panera Bread",      emoji: '🥐', domain: 'panerabread.com',       division: 'handheld' },
  { id: 23, name: "Domino's",          emoji: '🍕', domain: 'dominos.com',           division: 'handheld' },
  { id: 24, name: "Papa John's",       emoji: '🍕', domain: 'papajohns.com',         division: 'handheld' },
  // Sit-Down Showdown — casual dining
  { id: 25, name: "Olive Garden",      emoji: '🍝', domain: 'olivegarden.com',       division: 'sitdown'  },
  { id: 26, name: "Cheesecake Factory",emoji: '🍰', domain: 'thecheesecakefactory.com', division: 'sitdown' },
  { id: 27, name: "Texas Roadhouse",   emoji: '🥩', domain: 'texasroadhouse.com',    division: 'sitdown'  },
  { id: 28, name: "Applebee's",        emoji: '🍺', domain: 'applebees.com',         division: 'sitdown'  },
  { id: 29, name: "Chili's",           emoji: '🌶️', domain: 'chilis.com',            division: 'sitdown'  },
  { id: 30, name: "IHOP",              emoji: '🥞', domain: 'ihop.com',              division: 'sitdown'  },
  { id: 31, name: "Waffle House",      emoji: '🧇', domain: 'wafflehouse.com',       division: 'sitdown'  },
  { id: 32, name: "Pizza Hut",         emoji: '🍕', domain: 'pizzahut.com',          division: 'sitdown'  },
]

export const ROUND_NAMES = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Championship']
export const SHORT_ROUND_NAMES = ['R32', 'R16', 'QF', 'SF', 'Final']

// Each division occupies one quarter of the bracket using the standard
// 8-team pattern: 1v8, 4v5, 3v6, 2v7. Same-division teams can only meet in
// R32, R16, or QF — divisions only collide in the Semifinals.
const QUARTER_PATTERN = [[0, 7], [3, 4], [2, 5], [1, 6]]

export function buildInitialBracket(foods) {
  // Group input foods by division, preserving the user's chosen order.
  const byDiv = Object.fromEntries(DIVISIONS.map(d => [d.key, []]))
  for (const f of foods) {
    if (byDiv[f.division]) byDiv[f.division].push(f)
  }

  // Assign within-division seeds (1-8) from the user's order.
  const ranked = {}
  for (const { key } of DIVISIONS) {
    ranked[key] = byDiv[key].map((f, i) => ({ ...f, divisionSeed: i + 1 }))
  }

  // Pack quarters in DIVISIONS order: top-left, bottom-left, top-right, bottom-right.
  const matchups = []
  for (const { key } of DIVISIONS) {
    const teams = ranked[key]
    for (const [a, b] of QUARTER_PATTERN) {
      matchups.push({ top: teams[a], bottom: teams[b], winner: null })
    }
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
