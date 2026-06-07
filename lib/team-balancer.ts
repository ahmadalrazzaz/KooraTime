import { Player, Team } from '@/types'
import { generateId } from './utils'

export const DEFAULT_COLORS = [
  '#EF4444', // red
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
]

export function balanceTeams(
  players: Player[],
  numTeams: number,
  teamNames: string[],
  teamColors: string[],
  sessionId: string,
  lockedAssignments?: Map<string, string>
): { teams: Team[]; teamPlayers: { teamId: string; players: Player[] }[] } {
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: generateId(),
    session_id: sessionId,
    name: teamNames[i] || `Team ${String.fromCharCode(65 + i)}`,
    color: teamColors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    players: [],
  }))

  const sortedPlayers = [...players].sort((a, b) => b.skill_rating - a.skill_rating)
  const teamBuckets: Player[][] = Array.from({ length: numTeams }, () => [])

  const unlockedPlayers: Player[] = []
  for (const player of sortedPlayers) {
    if (lockedAssignments?.has(player.id)) {
      const teamId = lockedAssignments.get(player.id)!
      const teamIdx = teams.findIndex(t => t.id === teamId)
      if (teamIdx >= 0) teamBuckets[teamIdx].push(player)
    } else {
      unlockedPlayers.push(player)
    }
  }

  for (const player of unlockedPlayers) {
    const minSize = Math.min(...teamBuckets.map(b => b.length))
    const smallestTeams = teamBuckets
      .map((b, i) => ({ i, size: b.length, skill: b.reduce((s, p) => s + p.skill_rating, 0) }))
      .filter(t => t.size === minSize)

    const targetIdx = smallestTeams.reduce((best, t) => t.skill < best.skill ? t : best, smallestTeams[0]).i
    teamBuckets[targetIdx].push(player)
  }

  const result = teams.map((team, i) => ({ teamId: team.id, players: teamBuckets[i] }))
  return { teams, teamPlayers: result }
}
