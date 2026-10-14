const VALID_PHASES = new Set(['setup-players', 'setup-rounds', 'playing', 'podium'])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasUniqueIds(items) {
  const ids = items.map((item) => item.id)
  return new Set(ids).size === ids.length
}

function hasValidPlayers(players) {
  return (
    Array.isArray(players) &&
    players.every(
      (player) => isRecord(player) && isNonEmptyString(player.id) && isNonEmptyString(player.name),
    ) &&
    hasUniqueIds(players)
  )
}

function hasValidRounds(rounds) {
  return (
    Array.isArray(rounds) &&
    rounds.every(
      (round) =>
        isRecord(round) &&
        isNonEmptyString(round.id) &&
        isNonEmptyString(round.name) &&
        Number.isInteger(round.cards) &&
        round.cards > 0,
    ) &&
    hasUniqueIds(rounds)
  )
}

function hasValidScores(scores) {
  return (
    isRecord(scores) &&
    Object.values(scores).every(
      (roundScores) =>
        isRecord(roundScores) && Object.values(roundScores).every((score) => Number.isFinite(score)),
    )
  )
}

export function isValidGameState(state) {
  if (!isRecord(state) || !VALID_PHASES.has(state.phase)) return false
  if (!hasValidPlayers(state.players) || !hasValidRounds(state.rounds)) return false
  if (!hasValidScores(state.scores)) return false
  if (!Number.isInteger(state.currentRoundIndex) || state.currentRoundIndex < 0) return false

  if (state.phase === 'playing' || state.phase === 'podium') {
    return state.rounds.length > 0 && state.currentRoundIndex < state.rounds.length
  }

  return state.currentRoundIndex === 0
}
