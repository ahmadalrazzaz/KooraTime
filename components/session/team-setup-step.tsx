'use client'
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Team, Player } from '@/types'
import { Button } from '@/components/ui/button'
import { DEFAULT_COLORS } from '@/lib/team-balancer'
import { RotateCcw, Lock, Unlock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamWithPlayers extends Team {
  assignedPlayers: Player[]
}

interface Props {
  teams: TeamWithPlayers[]
  lockedPlayers: Set<string>
  onTeamsChange: (teams: TeamWithPlayers[]) => void
  onToggleLock: (playerId: string) => void
  onReshuffle: () => void
  onConfirm: () => void
  onBack: () => void
}

function SortablePlayerItem({ player, locked, onToggleLock }: { player: Player; locked: boolean; onToggleLock: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 p-2 bg-gray-800 rounded-lg text-sm',
        isDragging && 'opacity-40'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center font-medium text-xs flex-shrink-0">
        {player.name[0].toUpperCase()}
      </div>
      <span className="flex-1 truncate">{player.name}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: player.skill_rating }).map((_, i) => (
          <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onToggleLock() }}
        className={cn('p-1 rounded', locked ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400')}
      >
        {locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>
    </div>
  )
}

export function TeamSetupStep({ teams, lockedPlayers, onTeamsChange, onToggleLock, onReshuffle, onConfirm, onBack }: Props) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const findTeamByPlayer = useCallback((playerId: string) => {
    return teams.find(t => t.assignedPlayers.some(p => p.id === playerId))
  }, [teams])

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePlayerId(null)
    const { active, over } = event
    if (!over) return

    const activeTeam = findTeamByPlayer(active.id as string)
    const overTeam = teams.find(t => t.id === over.id) || findTeamByPlayer(over.id as string)

    if (!activeTeam || !overTeam || activeTeam.id === overTeam.id) return

    const player = activeTeam.assignedPlayers.find(p => p.id === active.id)
    if (!player) return

    onTeamsChange(teams.map(t => {
      if (t.id === activeTeam.id) return { ...t, assignedPlayers: t.assignedPlayers.filter(p => p.id !== player.id) }
      if (t.id === overTeam.id) return { ...t, assignedPlayers: [...t.assignedPlayers, player] }
      return t
    }))
  }

  const activePlayer = activePlayerId ? teams.flatMap(t => t.assignedPlayers).find(p => p.id === activePlayerId) : null

  const updateTeamName = (teamId: string, name: string) => {
    onTeamsChange(teams.map(t => t.id === teamId ? { ...t, name } : t))
  }

  const updateTeamColor = (teamId: string, color: string) => {
    onTeamsChange(teams.map(t => t.id === teamId ? { ...t, color } : t))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Drag players to rearrange</p>
        <button
          onClick={onReshuffle}
          className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          <RotateCcw size={14} /> Reshuffle
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActivePlayerId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(teams.length, 2)}, 1fr)` }}>
          {teams.map(team => (
            <div key={team.id} className="bg-gray-900 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateTeamColor(team.id, color)}
                      className={cn(
                        'w-5 h-5 rounded-full transition-transform',
                        team.color === color && 'scale-125 ring-2 ring-white'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <input
                value={team.name}
                onChange={e => updateTeamName(team.id, e.target.value)}
                className="bg-transparent border-b border-gray-700 focus:border-emerald-500 outline-none text-sm font-semibold w-full pb-1"
                style={{ color: team.color }}
              />
              <div className="text-xs text-gray-500 text-right">
                Avg: {team.assignedPlayers.length > 0
                  ? (team.assignedPlayers.reduce((s, p) => s + p.skill_rating, 0) / team.assignedPlayers.length).toFixed(1)
                  : '—'}
              </div>

              <SortableContext items={team.assignedPlayers.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div id={team.id} className="space-y-1.5 min-h-[60px]">
                  {team.assignedPlayers.map(player => (
                    <SortablePlayerItem
                      key={player.id}
                      player={player}
                      locked={lockedPlayers.has(player.id)}
                      onToggleLock={() => onToggleLock(player.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activePlayer && (
            <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg text-sm shadow-xl opacity-90">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center font-medium text-xs">
                {activePlayer.name[0].toUpperCase()}
              </div>
              <span>{activePlayer.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onConfirm} className="flex-1">Start Session</Button>
      </div>
    </div>
  )
}
