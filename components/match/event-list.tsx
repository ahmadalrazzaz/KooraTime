'use client'
import { MatchEvent, Team } from '@/types'
import { cn } from '@/lib/utils'

interface EventListProps {
  events: MatchEvent[]
  teamA: Team
  teamB: Team
  onUndo?: () => void
}

const eventEmoji: Record<string, string> = {
  goal: '⚽',
  own_goal: '🔴',
  penalty: '🎯',
}

export function EventList({ events, teamA, teamB, onUndo }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-center text-gray-600 text-sm py-4">No goals yet</p>
  }

  return (
    <div className="space-y-2">
      {events
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((event, idx) => {
          const isTeamA = teamA.id === event.team_id
          const team = isTeamA ? teamA : teamB
          return (
            <div key={event.id} className={cn('flex items-center gap-3 p-2 rounded-lg', isTeamA ? 'flex-row' : 'flex-row-reverse')}>
              <span className="text-lg">{eventEmoji[event.event_type]}</span>
              <div className={cn('flex-1', !isTeamA && 'text-right')}>
                <div className="text-sm font-medium" style={{ color: team.color }}>
                  {event.player?.name || 'Unknown'}
                  {event.event_type === 'own_goal' && ' (OG)'}
                  {event.event_type === 'penalty' && ' (P)'}
                </div>
                {event.assister?.name && (
                  <div className="text-xs text-gray-500">Assist: {event.assister.name}</div>
                )}
              </div>
              <span className="text-xs text-gray-600">{event.minute}&apos;</span>
              {idx === 0 && onUndo && (
                <button onClick={onUndo} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/20">
                  undo
                </button>
              )}
            </div>
          )
        })}
    </div>
  )
}
