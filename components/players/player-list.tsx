'use client'
import { useState } from 'react'
import { Player } from '@/types'
import { PlayerCard } from './player-card'
import { Search } from 'lucide-react'

interface PlayerListProps {
  players: Player[]
  selectedIds?: Set<string>
  onSelect?: (player: Player) => void
  onEdit?: (player: Player) => void
  emptyMessage?: string
}

export function PlayerList({ players, selectedIds, onSelect, onEdit, emptyMessage }: PlayerListProps) {
  const [search, setSearch] = useState('')

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search players..."
          className="bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {search ? 'No players match your search' : (emptyMessage || 'No players yet')}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              selected={selectedIds?.has(player.id)}
              onSelect={onSelect ? () => onSelect(player) : undefined}
              onEdit={onEdit ? () => onEdit(player) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
