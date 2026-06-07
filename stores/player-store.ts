import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '@/types'
import { generateId } from '@/lib/utils'

interface PlayerState {
  players: Player[]
  hydrated: boolean
  addPlayer: (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => Player
  updatePlayer: (id: string, data: Partial<Player>) => void
  deletePlayer: (id: string) => void
  getPlayer: (id: string) => Player | undefined
  syncFromSupabase: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      players: [],
      hydrated: false,

      addPlayer: (data) => {
        const now = new Date().toISOString()
        const player: Player = { ...data, id: generateId(), created_at: now, updated_at: now }
        set(state => ({ players: [...state.players, player] }))
        // Sync to Supabase in background
        import('@/lib/supabase/db').then(({ upsertPlayer, getUser }) => {
          getUser().then(user => { if (user) upsertPlayer(player).catch(console.error) })
        })
        return player
      },

      updatePlayer: (id, data) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
          ),
        }))
        const player = get().players.find(p => p.id === id)
        if (player) {
          import('@/lib/supabase/db').then(({ upsertPlayer, getUser }) => {
            getUser().then(user => { if (user) upsertPlayer(player).catch(console.error) })
          })
        }
      },

      deletePlayer: (id) => {
        set(state => ({ players: state.players.filter(p => p.id !== id) }))
        import('@/lib/supabase/db').then(({ deletePlayerDb, getUser }) => {
          getUser().then(user => { if (user) deletePlayerDb(id).catch(console.error) })
        })
      },

      getPlayer: (id) => get().players.find(p => p.id === id),

      syncFromSupabase: async () => {
        try {
          const { fetchPlayers, getUser } = await import('@/lib/supabase/db')
          const user = await getUser()
          if (!user) return
          const players = await fetchPlayers()
          set({ players, hydrated: true })
        } catch (e) {
          console.error('Failed to sync players from Supabase', e)
        }
      },
    }),
    { name: 'kooratime_players' }
  )
)
