'use client'
import { useState } from 'react'
import { Player, Team, MatchEvent } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GoalFormProps {
  scoringTeam: Team
  opposingTeam: Team
  allPlayers: Player[]
  teamAId: string
  teamBId: string
  matchId: string
  minute: number
  onSubmit: (event: Omit<MatchEvent, 'id' | 'created_at'>) => void
  onCancel: () => void
}

type EventType = 'goal' | 'own_goal' | 'penalty'

export function GoalForm({ scoringTeam, opposingTeam, allPlayers, matchId, minute, onSubmit, onCancel }: GoalFormProps) {
  const [eventType, setEventType] = useState<EventType>('goal')
  const [scorerId, setScorerId] = useState<string | undefined>()
  const [assisterId, setAssisterId] = useState<string | undefined>()

  const scoringTeamPlayers = allPlayers.filter(p =>
    scoringTeam.players?.some(tp => tp.player_id === p.id)
  )
  const opposingTeamPlayers = allPlayers.filter(p =>
    opposingTeam.players?.some(tp => tp.player_id === p.id)
  )

  // For own goal, the team that scored against themselves gets the "team_id"
  const effectiveTeam = eventType === 'own_goal' ? opposingTeam : scoringTeam
  const scorerPool = eventType === 'own_goal' ? opposingTeamPlayers : scoringTeamPlayers

  const handleSubmit = () => {
    onSubmit({
      match_id: matchId,
      team_id: effectiveTeam.id,
      player_id: scorerId,
      assister_id: eventType === 'goal' ? assisterId : undefined,
      event_type: eventType,
      minute,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-400 mb-2">Goal Type</p>
        <div className="flex gap-2">
          {(['goal', 'penalty', 'own_goal'] as EventType[]).map(type => (
            <button
              key={type}
              onClick={() => setEventType(type)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                eventType === type ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'
              )}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-400 mb-2">
          {eventType === 'own_goal' ? 'Own Goal By (from opponent)' : 'Scored By'}
        </p>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <button
            onClick={() => setScorerId(undefined)}
            className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', !scorerId ? 'bg-emerald-800 text-emerald-200' : 'hover:bg-gray-800 text-gray-400')}
          >
            Unknown / No player
          </button>
          {scorerPool.map(p => (
            <button
              key={p.id}
              onClick={() => setScorerId(p.id)}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', scorerId === p.id ? 'bg-emerald-800 text-emerald-200' : 'hover:bg-gray-800')}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {eventType === 'goal' && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Assist By (optional)</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <button
              onClick={() => setAssisterId(undefined)}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', !assisterId ? 'bg-gray-800 text-gray-300' : 'hover:bg-gray-800 text-gray-500')}
            >
              No assist
            </button>
            {scoringTeamPlayers.filter(p => p.id !== scorerId).map(p => (
              <button
                key={p.id}
                onClick={() => setAssisterId(p.id)}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm', assisterId === p.id ? 'bg-blue-900 text-blue-200' : 'hover:bg-gray-800')}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Confirm Goal</Button>
      </div>
    </div>
  )
}
