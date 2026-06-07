'use client'
import { Player } from '@/types'
import { cn } from '@/lib/utils'
import { Star, UserCheck } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  showStats?: boolean
  compact?: boolean
}

const positionColors: Record<string, string> = {
  goalkeeper: 'text-yellow-400',
  defender: 'text-blue-400',
  midfielder: 'text-green-400',
  forward: 'text-red-400',
  flexible: 'text-purple-400',
}

export function PlayerCard({ player, selected, onSelect, onEdit, compact }: PlayerCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-gray-900 rounded-xl p-3 flex items-center gap-3 transition-all',
        onSelect && 'cursor-pointer hover:bg-gray-800',
        selected && 'ring-2 ring-emerald-500 bg-gray-800'
      )}
    >
      <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
        {player.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{player.name}</span>
          {player.is_guest && (
            <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">Guest</span>
          )}
        </div>
        {!compact && (
          <div className="flex items-center gap-2 mt-0.5">
            {player.position && (
              <span className={cn('text-xs capitalize', positionColors[player.position] || 'text-gray-400')}>
                {player.position}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < player.skill_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {selected && <UserCheck size={18} className="text-emerald-400 flex-shrink-0" />}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="text-gray-500 hover:text-white p-1"
        >
          ···
        </button>
      )}
    </div>
  )
}
