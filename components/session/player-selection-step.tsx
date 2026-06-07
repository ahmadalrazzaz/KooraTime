'use client'
import { useState } from 'react'
import { Player } from '@/types'
import { PlayerList } from '@/components/players/player-list'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { PlayerForm } from '@/components/players/player-form'
import { usePlayerStore } from '@/stores/player-store'
import { UserPlus } from 'lucide-react'

interface Props {
  players: Player[]
  selectedIds: Set<string>
  onToggle: (player: Player) => void
  onNext: () => void
  onBack: () => void
  numTeams: number
}

export function PlayerSelectionStep({ players, selectedIds, onToggle, onNext, onBack, numTeams }: Props) {
  const { addPlayer } = usePlayerStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)

  const handleAddPlayer = (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    const player = addPlayer(data)
    onToggle(player)
    setShowAddModal(false)
  }

  const handleAddGuest = (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    const player = addPlayer({ ...data, is_guest: true })
    onToggle(player)
    setShowGuestModal(false)
  }

  const selected = selectedIds.size
  const minPlayers = numTeams * 2

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {selected} selected · min {minPlayers} needed
          </p>
          {selected > 0 && selected < minPlayers && (
            <p className="text-xs text-yellow-400">Need at least {minPlayers - selected} more</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGuestModal(true)}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800"
          >
            <UserPlus size={14} /> Guest
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800"
          >
            <UserPlus size={14} /> New Player
          </button>
        </div>
      </div>

      <PlayerList
        players={players}
        selectedIds={selectedIds}
        onSelect={onToggle}
        emptyMessage="No players in your roster. Add some!"
      />

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button
          onClick={onNext}
          disabled={selected < minPlayers}
          className="flex-1"
        >
          Next: Setup Teams
        </Button>
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Player">
        <PlayerForm
          onSubmit={handleAddPlayer}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal open={showGuestModal} onClose={() => setShowGuestModal(false)} title="Add Guest">
        <PlayerForm
          player={{ id: '', name: '', skill_rating: 3, is_guest: true, created_at: '', updated_at: '' }}
          onSubmit={handleAddGuest}
          onCancel={() => setShowGuestModal(false)}
        />
      </Modal>
    </div>
  )
}
