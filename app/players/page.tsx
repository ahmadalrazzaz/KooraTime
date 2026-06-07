'use client'
import { useState, useEffect } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { Navbar } from '@/components/layout/navbar'
import { PageHeader } from '@/components/layout/page-header'
import { PlayerList } from '@/components/players/player-list'
import { PlayerForm } from '@/components/players/player-form'
import { Modal } from '@/components/ui/modal'
import { Player } from '@/types'
import { Plus } from 'lucide-react'

export default function PlayersPage() {
  const { players, addPlayer, updatePlayer, deletePlayer, syncFromSupabase } = usePlayerStore()
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    syncFromSupabase()
  }, [])
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleAdd = (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    addPlayer(data)
    setShowAddModal(false)
  }

  const handleEdit = (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingPlayer) return
    updatePlayer(editingPlayer.id, data)
    setEditingPlayer(null)
  }

  const handleDelete = (id: string) => {
    deletePlayer(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Players"
        subtitle={`${players.length} in roster`}
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white transition-colors"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4">
        <PlayerList
          players={players}
          onEdit={setEditingPlayer}
          emptyMessage="No players yet. Add your first player!"
        />
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Player">
        <PlayerForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal open={!!editingPlayer} onClose={() => setEditingPlayer(null)} title="Edit Player">
        {editingPlayer && (
          <div className="space-y-4">
            <PlayerForm
              player={editingPlayer}
              onSubmit={handleEdit}
              onCancel={() => setEditingPlayer(null)}
            />
            <button
              onClick={() => setDeleteConfirm(editingPlayer.id)}
              className="w-full text-red-400 hover:text-red-300 text-sm py-2"
            >
              Delete Player
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Player?">
        <p className="text-gray-400 mb-4">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>

      <Navbar />
    </div>
  )
}
