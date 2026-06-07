import { createClient } from './client'
import { Player, Session, Team, Match, MatchEvent } from '@/types'

// --- Players ---
export async function fetchPlayers(): Promise<Player[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function upsertPlayer(player: Player): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('players').upsert({
    id: player.id,
    name: player.name,
    skill_rating: player.skill_rating,
    position: player.position || null,
    is_guest: player.is_guest,
    created_at: player.created_at,
    updated_at: player.updated_at,
  })
  if (error) throw error
}

export async function deletePlayerDb(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

// --- Sessions ---
export async function fetchSessions(): Promise<Session[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function upsertSession(session: Session): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('sessions').upsert({
    id: session.id,
    name: session.name,
    date: session.date,
    location: session.location || null,
    session_duration: session.session_duration,
    match_duration: session.match_duration,
    break_duration: session.break_duration,
    num_teams: session.num_teams,
    status: session.status,
    created_at: session.created_at,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

// --- Teams ---
export async function upsertTeams(teams: Team[]): Promise<void> {
  const supabase = createClient()
  for (const team of teams) {
    const { error } = await supabase.from('teams').upsert({
      id: team.id,
      session_id: team.session_id,
      name: team.name,
      color: team.color,
    })
    if (error) throw error

    if (team.players && team.players.length > 0) {
      const rows = team.players.map(tp => ({
        id: tp.id,
        team_id: team.id,
        player_id: tp.player_id,
      }))
      const { error: tpErr } = await supabase.from('team_players').upsert(rows)
      if (tpErr) throw tpErr
    }
  }
}

// --- Matches ---
export async function fetchMatchesForSession(sessionId: string): Promise<Match[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('session_id', sessionId)
    .order('match_number')
  if (error) throw error
  return data || []
}

export async function upsertMatch(match: Match): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('matches').upsert({
    id: match.id,
    session_id: match.session_id,
    match_number: match.match_number,
    team_a_id: match.team_a_id,
    team_b_id: match.team_b_id,
    score_a: match.score_a,
    score_b: match.score_b,
    status: match.status,
    started_at: match.started_at || null,
    ended_at: match.ended_at || null,
    timer_state: match.timer_state || null,
  })
  if (error) throw error
}

export async function upsertMatches(matches: Match[]): Promise<void> {
  for (const m of matches) await upsertMatch(m)
}

// --- Match events ---
export async function fetchEventsForSession(sessionId: string): Promise<MatchEvent[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('match_events')
    .select(`*, matches!inner(session_id)`)
    .eq('matches.session_id', sessionId)
    .order('created_at')
  if (error) throw error
  return (data || []).map(({ matches: _, ...e }) => e as MatchEvent)
}

export async function upsertEvent(event: MatchEvent): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('match_events').upsert({
    id: event.id,
    match_id: event.match_id,
    team_id: event.team_id,
    player_id: event.player_id || null,
    assister_id: event.assister_id || null,
    event_type: event.event_type,
    minute: event.minute,
    created_at: event.created_at,
  })
  if (error) throw error
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('match_events').delete().eq('id', id)
  if (error) throw error
}

// --- Auth helpers ---
export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function fetchFullSession(sessionId: string) {
  const supabase = createClient()
  const teamIdsResult = await supabase.from('teams').select('id').eq('session_id', sessionId)
  const teamIds = teamIdsResult.data?.map(t => t.id) || []

  const matchIdsResult = await supabase.from('matches').select('id').eq('session_id', sessionId)
  const matchIds = matchIdsResult.data?.map(m => m.id) || []

  const [
    { data: session },
    { data: teams },
    { data: teamPlayers },
    { data: matches },
    { data: events },
  ] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('teams').select('*').eq('session_id', sessionId),
    supabase.from('team_players').select('*, player:players(*)').in('team_id', teamIds),
    supabase.from('matches').select('*').eq('session_id', sessionId).order('match_number'),
    supabase.from('match_events').select('*').in('match_id', matchIds),
  ])

  const enrichedTeams = (teams || []).map(team => ({
    ...team,
    players: (teamPlayers || []).filter(tp => tp.team_id === team.id),
  }))

  const enrichedMatches = (matches || []).map(match => ({
    ...match,
    team_a: enrichedTeams.find(t => t.id === match.team_a_id),
    team_b: enrichedTeams.find(t => t.id === match.team_b_id),
  }))

  return {
    session,
    teams: enrichedTeams,
    matches: enrichedMatches,
    events: events || [],
  }
}

export async function fetchSessionHistory(): Promise<{ session: Session; teams: Team[]; matches: Match[]; events: MatchEvent[] }[]> {
  const supabase = createClient()
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !sessions) return []

  const results = await Promise.all(
    sessions.map(async (session) => {
      const matchIdsResult = await supabase.from('matches').select('id').eq('session_id', session.id)
      const matchIds = matchIdsResult.data?.map(m => m.id) || []

      const [{ data: teams }, { data: matches }, { data: events }] = await Promise.all([
        supabase.from('teams').select('*').eq('session_id', session.id),
        supabase.from('matches').select('*').eq('session_id', session.id).order('match_number'),
        supabase.from('match_events').select('*').in('match_id', matchIds),
      ])
      return {
        session: session as Session,
        teams: (teams || []) as Team[],
        matches: (matches || []) as Match[],
        events: (events || []) as MatchEvent[],
      }
    })
  )
  return results
}
