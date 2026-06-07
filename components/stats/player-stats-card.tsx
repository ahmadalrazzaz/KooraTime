'use client'
import { PlayerStats } from '@/types'
import { Star } from 'lucide-react'

interface PlayerStatsCardProps {
  stats: PlayerStats
  rank?: number
}

export function PlayerStatsCard({ stats, rank }: PlayerStatsCardProps) {
  const player = stats.player
  if (!player) return null

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
      {rank && (
        <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0">
          {rank}
        </div>
      )}
      <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
        {player.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{player.name}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {Array.from({ length: player.skill_rating }).map((_, i) => (
            <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>
      <div className="flex gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-emerald-400">{stats.goals}</div>
          <div className="text-xs text-gray-500">Goals</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">{stats.assists}</div>
          <div className="text-xs text-gray-500">Assists</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-300">{stats.matches_played}</div>
          <div className="text-xs text-gray-500">MP</div>
        </div>
      </div>
    </div>
  )
}
