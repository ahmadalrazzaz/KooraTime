import { Match, Team } from '@/types'
import { generateId } from './utils'

export function generateSchedule(
  teams: Team[],
  sessionDuration: number,
  matchDuration: number,
  breakDuration: number,
  sessionId: string
): { matches: Match[]; unusedMinutes: number } {
  const matchSlot = matchDuration + breakDuration
  const totalMatches = Math.floor(sessionDuration / matchSlot)
  const unusedMinutes = sessionDuration - totalMatches * matchSlot

  const numTeams = teams.length
  const matchups: [number, number][] = []

  if (numTeams === 2) {
    for (let i = 0; i < totalMatches; i++) {
      matchups.push([0, 1])
    }
  } else {
    const allMatchups = generateRoundRobin(numTeams)
    for (let i = 0; i < totalMatches; i++) {
      matchups.push(allMatchups[i % allMatchups.length])
    }
  }

  for (let i = 1; i < matchups.length; i++) {
    if (matchups[i][0] === matchups[i - 1][0] && matchups[i][1] === matchups[i - 1][1]) {
      for (let j = i + 1; j < matchups.length; j++) {
        if (matchups[j][0] !== matchups[i - 1][0] || matchups[j][1] !== matchups[i - 1][1]) {
          ;[matchups[i], matchups[j]] = [matchups[j], matchups[i]]
          break
        }
      }
    }
  }

  const matches: Match[] = matchups.map((m, idx) => ({
    id: generateId(),
    session_id: sessionId,
    match_number: idx + 1,
    team_a_id: teams[m[0]].id,
    team_b_id: teams[m[1]].id,
    team_a: teams[m[0]],
    team_b: teams[m[1]],
    score_a: 0,
    score_b: 0,
    status: 'pending' as const,
  }))

  return { matches, unusedMinutes }
}

function generateRoundRobin(n: number): [number, number][] {
  const matchups: [number, number][] = []
  const teams = Array.from({ length: n }, (_, i) => i)

  const hasOdd = n % 2 !== 0
  if (hasOdd) teams.push(-1)

  const rounds = teams.length - 1
  const half = teams.length / 2

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = teams[i]
      const b = teams[teams.length - 1 - i]
      if (a !== -1 && b !== -1) {
        matchups.push([a, b])
      }
    }
    teams.splice(1, 0, teams.pop()!)
  }

  return matchups
}
