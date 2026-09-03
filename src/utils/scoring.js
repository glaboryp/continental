export function calculateTotals(players, scores) {
  return players.map((player) => {
    const total = Object.values(scores).reduce((sum, roundScores) => {
      return sum + (roundScores[player.id] ?? 0)
    }, 0)
    return { id: player.id, name: player.name, total }
  })
}

export function rankPlayers(totals) {
  const sorted = [...totals].sort((a, b) => a.total - b.total)
  let lastTotal = null
  let lastPosition = 0
  return sorted.map((entry, index) => {
    const position = entry.total === lastTotal ? lastPosition : index + 1
    lastTotal = entry.total
    lastPosition = position
    return { ...entry, position }
  })
}

export function getPodium(rankedPlayers) {
  return {
    podium: rankedPlayers.filter((entry) => entry.position <= 3),
    rest: rankedPlayers.filter((entry) => entry.position > 3),
  }
}
