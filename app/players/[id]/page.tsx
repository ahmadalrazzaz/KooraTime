'use client'
import { usePlayerStore } from '@/stores/player-store'
import { PageHeader } from '@/components/layout/page-header'
import { Star, Trophy, Target, Handshake } from 'lucide-react'
import { cn } from '@/lib/utils'

const positionColors: Record<string, string> = {
  goalkeeper: 'text-yellow-400 bg-yellow-900',
  defender: 'text-blue-400 bg-blue-900',
  midfielder: 'text-green-400 bg-green-900',
  forward: 'text-red-400 bg-red-900',
  flexible: 'text-purple-400 bg-purple-900',
}

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { getPlayer } = usePlayerStore()
  const player = getPlayer(id)

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Player not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="Player Profile" back />

      <div className="px-4 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-4xl mb-3">
            {player.name[0].toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold">{player.name}</h2>
          {player.is_guest && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded mt-1">Guest</span>
          )}
          {player.position && (
            <span className={cn('text-sm px-3 py-1 rounded-full capitalize mt-2', positionColors[player.position])}>
              {player.position}
            </span>
          )}
        </div>

        {/* Skill Rating */}
        <div className="bg-gray-900 rounded-2xl p-4">
          <h3 className="text-sm text-gray-400 mb-3">Skill Rating</h3>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={32}
                className={i < player.skill_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
              />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-2">{player.skill_rating}/5</p>
        </div>

        {/* Info */}
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Member since</span>
            <span>{new Date(player.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Type</span>
            <span>{player.is_guest ? 'Guest' : 'Regular'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
