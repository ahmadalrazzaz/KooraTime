import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '@/types'
import { generateId } from '@/lib/utils'

interface PlayerState {
  players: Player[]
  addPlayer: (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => Player
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void
  getPlayer: (id: string) => Player | undefined
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      players: [],

      addPlayer: (data) => {
        const now = new Date().toISOString()
        const player: Player = { ...data, id: generateId(), created_at: now, updated_at: now }
        set(state => ({ players: [...state.players, player] }))
        return player
      },

      updatePlayer: (id, data) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
          ),
        }))
      },

      deletePlayer: (id) => {
        set(state => ({ players: state.players.filter(p => p.id !== id) }))
      },

      getPlayer: (id) => get().players.find(p => p.id === id),
    }),
    { name: 'kooratime_players' }
  )
)
