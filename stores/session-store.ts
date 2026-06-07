import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Session, Team, Match, MatchEvent, TimerState, Standing, PlayerStats, Player } from '@/types'
import { generateId } from '@/lib/utils'
import { saveToHistory } from '@/lib/local-storage'

interface SessionState {
  session: Session | null
  players: Player[]
  teams: Team[]
  matches: Match[]
  events: MatchEvent[]
  currentMatchId: string | null
  timerState: TimerState | null

  setSession: (session: Session) => void
  setPlayers: (players: Player[]) => void
  setTeams: (teams: Team[]) => void
  setMatches: (matches: Match[]) => void
  clearSession: () => void

  startMatch: (matchId: string, durationMinutes: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  endMatch: (matchId: string) => void
  addGoal: (event: Omit<MatchEvent, 'id' | 'created_at'>) => void
  undoLastGoal: (matchId: string) => void
  updateScore: (matchId: string, scoreA: number, scoreB: number) => void
  confirmMatch: (matchId: string) => void

  syncSessionToSupabase: () => Promise<void>
  loadSessionFromSupabase: (sessionId: string) => Promise<void>

  computeStandings: () => Standing[]
  computePlayerStats: () => PlayerStats[]
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,
      players: [],
      teams: [],
      matches: [],
      events: [],
      currentMatchId: null,
      timerState: null,

      setSession: (session) => set({ session }),
      setPlayers: (players) => set({ players }),
      setTeams: (teams) => set({ teams }),
      setMatches: (matches) => set({ matches }),

      clearSession: () => {
        const state = get()
        if (state.session) {
          saveToHistory({
            session: state.session,
            players: state.players,
            teams: state.teams,
            matches: state.matches,
            events: state.events,
            current_match_id: state.currentMatchId ?? undefined,
            timer_state: state.timerState ?? undefined,
          })
          // Sync completed session to Supabase
          const completedSession: Session = { ...state.session, status: 'completed' }
          import('@/lib/supabase/db').then(async ({ upsertSession, getUser }) => {
            const user = await getUser()
            if (!user) return
            upsertSession(completedSession).catch(console.error)
          })
        }
        set({ session: null, players: [], teams: [], matches: [], events: [], currentMatchId: null, timerState: null })
      },

      startMatch: (matchId, durationMinutes) => {
        const duration = durationMinutes * 60
        const timerState: TimerState = {
          duration,
          remaining: duration,
          is_running: true,
          start_timestamp: Date.now(),
        }
        set(state => ({
          currentMatchId: matchId,
          timerState,
          matches: state.matches.map(m =>
            m.id === matchId
              ? { ...m, status: 'in_progress' as const, started_at: new Date().toISOString() }
              : m
          ),
        }))
        const updatedMatch = get().matches.find(m => m.id === matchId)
        if (updatedMatch) {
          import('@/lib/supabase/db').then(async ({ upsertMatch, getUser }) => {
            const user = await getUser()
            if (!user) return
            upsertMatch(updatedMatch).catch(console.error)
          })
        }
      },

      pauseTimer: () => {
        set(state => {
          if (!state.timerState || !state.timerState.is_running) return state
          const elapsed = (Date.now() - (state.timerState.start_timestamp || Date.now())) / 1000
          const remaining = Math.max(0, state.timerState.duration - elapsed)
          return {
            timerState: {
              ...state.timerState,
              remaining,
              is_running: false,
              paused_at: Date.now(),
            },
          }
        })
      },

      resumeTimer: () => {
        set(state => {
          if (!state.timerState || state.timerState.is_running) return state
          return {
            timerState: {
              ...state.timerState,
              is_running: true,
              start_timestamp: Date.now() - (state.timerState.duration - state.timerState.remaining) * 1000,
              paused_at: undefined,
            },
          }
        })
      },

      endMatch: (matchId) => {
        set(state => ({
          timerState: null,
          currentMatchId: null,
          matches: state.matches.map(m =>
            m.id === matchId
              ? { ...m, status: 'finished' as const, ended_at: new Date().toISOString() }
              : m
          ),
        }))
        const updatedMatch = get().matches.find(m => m.id === matchId)
        if (updatedMatch) {
          import('@/lib/supabase/db').then(async ({ upsertMatch, getUser }) => {
            const user = await getUser()
            if (!user) return
            upsertMatch(updatedMatch).catch(console.error)
          })
        }
      },

      addGoal: (eventData) => {
        const event: MatchEvent = {
          ...eventData,
          id: generateId(),
          created_at: new Date().toISOString(),
        }
        set(state => {
          const match = state.matches.find(m => m.id === eventData.match_id)
          if (!match) return state

          let newScoreA = match.score_a
          let newScoreB = match.score_b

          if (eventData.event_type === 'own_goal') {
            if (match.team_a_id === eventData.team_id) newScoreB++
            else newScoreA++
          } else {
            if (match.team_a_id === eventData.team_id) newScoreA++
            else newScoreB++
          }

          return {
            events: [...state.events, event],
            matches: state.matches.map(m =>
              m.id === eventData.match_id
                ? { ...m, score_a: newScoreA, score_b: newScoreB }
                : m
            ),
          }
        })
        import('@/lib/supabase/db').then(async ({ upsertEvent, upsertMatch, getUser }) => {
          const user = await getUser()
          if (!user) return
          upsertEvent(event).catch(console.error)
          const updatedMatch = get().matches.find(m => m.id === eventData.match_id)
          if (updatedMatch) upsertMatch(updatedMatch).catch(console.error)
        })
      },

      undoLastGoal: (matchId) => {
        let removedEventId: string | null = null
        set(state => {
          const matchEvents = state.events
            .filter(e => e.match_id === matchId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

          if (matchEvents.length === 0) return state
          const lastEvent = matchEvents[0]
          removedEventId = lastEvent.id
          const match = state.matches.find(m => m.id === matchId)
          if (!match) return state

          let newScoreA = match.score_a
          let newScoreB = match.score_b

          if (lastEvent.event_type === 'own_goal') {
            if (match.team_a_id === lastEvent.team_id) newScoreB = Math.max(0, newScoreB - 1)
            else newScoreA = Math.max(0, newScoreA - 1)
          } else {
            if (match.team_a_id === lastEvent.team_id) newScoreA = Math.max(0, newScoreA - 1)
            else newScoreB = Math.max(0, newScoreB - 1)
          }

          return {
            events: state.events.filter(e => e.id !== lastEvent.id),
            matches: state.matches.map(m =>
              m.id === matchId ? { ...m, score_a: newScoreA, score_b: newScoreB } : m
            ),
          }
        })
        if (removedEventId) {
          const eventId = removedEventId
          import('@/lib/supabase/db').then(async ({ deleteEvent, upsertMatch, getUser }) => {
            const user = await getUser()
            if (!user) return
            deleteEvent(eventId).catch(console.error)
            const updatedMatch = get().matches.find(m => m.id === matchId)
            if (updatedMatch) upsertMatch(updatedMatch).catch(console.error)
          })
        }
      },

      updateScore: (matchId, scoreA, scoreB) => {
        set(state => ({
          matches: state.matches.map(m =>
            m.id === matchId ? { ...m, score_a: scoreA, score_b: scoreB } : m
          ),
        }))
      },

      confirmMatch: (matchId) => {
        set(state => ({
          matches: state.matches.map(m =>
            m.id === matchId ? { ...m, status: 'finished' as const, ended_at: m.ended_at || new Date().toISOString() } : m
          ),
        }))
        const updatedMatch = get().matches.find(m => m.id === matchId)
        const currentSession = get().session
        if (updatedMatch) {
          import('@/lib/supabase/db').then(async ({ upsertMatch, upsertSession, getUser }) => {
            const user = await getUser()
            if (!user) return
            upsertMatch(updatedMatch).catch(console.error)
            if (currentSession) upsertSession(currentSession).catch(console.error)
          })
        }
      },

      syncSessionToSupabase: async () => {
        const state = get()
        if (!state.session) return
        try {
          const { upsertSession, upsertTeams, upsertMatches, getUser } = await import('@/lib/supabase/db')
          const user = await getUser()
          if (!user) return
          await upsertSession(state.session)
          await upsertTeams(state.teams)
          await upsertMatches(state.matches)
        } catch (e) {
          console.error('Failed to sync session to Supabase', e)
        }
      },

      loadSessionFromSupabase: async (sessionId: string) => {
        try {
          const { fetchFullSession, getUser } = await import('@/lib/supabase/db')
          const user = await getUser()
          if (!user) return
          const { session, teams, matches, events } = await fetchFullSession(sessionId)
          if (session) {
            set({
              session: session as Session,
              teams: teams as Team[],
              matches: matches as Match[],
              events: events as MatchEvent[],
            })
          }
        } catch (e) {
          console.error('Failed to load session from Supabase', e)
        }
      },

      computeStandings: () => {
        const { teams, matches } = get()
        const standings: Map<string, Standing> = new Map()

        for (const team of teams) {
          standings.set(team.id, {
            team_id: team.id,
            team,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            goal_difference: 0,
            points: 0,
          })
        }

        for (const match of matches.filter(m => m.status === 'finished')) {
          const a = standings.get(match.team_a_id)
          const b = standings.get(match.team_b_id)
          if (!a || !b) continue

          a.played++
          b.played++
          a.goals_for += match.score_a
          a.goals_against += match.score_b
          b.goals_for += match.score_b
          b.goals_against += match.score_a

          if (match.score_a > match.score_b) {
            a.wins++; a.points += 3; b.losses++
          } else if (match.score_b > match.score_a) {
            b.wins++; b.points += 3; a.losses++
          } else {
            a.draws++; a.points++; b.draws++; b.points++
          }

          a.goal_difference = a.goals_for - a.goals_against
          b.goal_difference = b.goals_for - b.goals_against
        }

        return Array.from(standings.values()).sort(
          (a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for
        )
      },

      computePlayerStats: () => {
        const { players, teams, matches, events } = get()
        const statsMap: Map<string, PlayerStats> = new Map()

        for (const player of players) {
          statsMap.set(player.id, {
            player_id: player.id,
            player,
            matches_played: 0,
            goals: 0,
            assists: 0,
            wins: 0,
            draws: 0,
            losses: 0,
          })
        }

        // Goal and assist counts
        for (const event of events) {
          if (event.player_id) {
            const ps = statsMap.get(event.player_id)
            if (ps) {
              if (event.event_type !== 'own_goal') ps.goals++
              else ps.losses++ // penalize own goals loosely; just increment nothing special
            }
          }
          if (event.assister_id) {
            const ps = statsMap.get(event.assister_id)
            if (ps) ps.assists++
          }
        }

        // Match results
        for (const match of matches.filter(m => m.status === 'finished')) {
          const teamA = teams.find(t => t.id === match.team_a_id)
          const teamB = teams.find(t => t.id === match.team_b_id)

          const playersInTeamA = players.filter(p =>
            teamA?.players?.some(tp => tp.player_id === p.id)
          )
          const playersInTeamB = players.filter(p =>
            teamB?.players?.some(tp => tp.player_id === p.id)
          )

          const allInMatch = [...playersInTeamA, ...playersInTeamB]
          for (const p of allInMatch) {
            const ps = statsMap.get(p.id)
            if (!ps) continue
            ps.matches_played++
            if (playersInTeamA.includes(p)) {
              if (match.score_a > match.score_b) ps.wins++
              else if (match.score_a < match.score_b) ps.losses++
              else ps.draws++
            } else {
              if (match.score_b > match.score_a) ps.wins++
              else if (match.score_b < match.score_a) ps.losses++
              else ps.draws++
            }
          }
        }

        return Array.from(statsMap.values()).sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      },
    }),
    {
      name: 'kooratime_session',
    }
  )
)
