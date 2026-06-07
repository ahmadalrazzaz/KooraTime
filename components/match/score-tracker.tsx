'use client'
import { Match, Team } from '@/types'
import { cn } from '@/lib/utils'

interface ScoreTrackerProps {
  match: Match
  teamA: Team
  teamB: Team
  onGoal: (teamId: string) => void
}

export function ScoreTracker({ match, teamA, teamB, onGoal }: ScoreTrackerProps) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="flex-1 flex flex-col items-center gap-3">
        <div
          className="font-bold text-lg text-center px-2 py-1 rounded-lg w-full text-center"
          style={{ color: teamA.color, backgroundColor: teamA.color + '20' }}
        >
          {teamA.name}
        </div>
        <span className="text-7xl font-bold tabular-nums">{match.score_a}</span>
        <button
          onClick={() => onGoal(teamA.id)}
          className="w-full py-5 rounded-2xl text-white font-bold text-xl active:scale-95 transition-transform shadow-lg"
          style={{ backgroundColor: teamA.color }}
        >
          + GOAL
        </button>
      </div>

      <div className="flex items-center px-2">
        <span className="text-3xl text-gray-600 font-bold">–</span>
      </div>

      <div className="flex-1 flex flex-col items-center gap-3">
        <div
          className="font-bold text-lg text-center px-2 py-1 rounded-lg w-full text-center"
          style={{ color: teamB.color, backgroundColor: teamB.color + '20' }}
        >
          {teamB.name}
        </div>
        <span className="text-7xl font-bold tabular-nums">{match.score_b}</span>
        <button
          onClick={() => onGoal(teamB.id)}
          className="w-full py-5 rounded-2xl text-white font-bold text-xl active:scale-95 transition-transform shadow-lg"
          style={{ backgroundColor: teamB.color }}
        >
          + GOAL
        </button>
      </div>
    </div>
  )
}
