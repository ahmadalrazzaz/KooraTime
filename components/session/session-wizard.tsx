'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionDetailsStep, SessionDetailsData } from './session-details-step'
import { PlayerSelectionStep } from './player-selection-step'
import { TeamSetupStep } from './team-setup-step'
import { usePlayerStore } from '@/stores/player-store'
import { useSessionStore } from '@/stores/session-store'
import { balanceTeams } from '@/lib/team-balancer'
import { generateSchedule } from '@/lib/schedule-generator'
import { generateId } from '@/lib/utils'
import { Player, Team, Session } from '@/types'
import { DEFAULT_COLORS } from '@/lib/team-balancer'

interface TeamWithPlayers extends Team {
  assignedPlayers: Player[]
}

export function SessionWizard() {
  const router = useRouter()
  const { players: allPlayers } = usePlayerStore()
  const { setSession, setPlayers, setTeams, setMatches } = useSessionStore()

  const [step, setStep] = useState(1)
  const [sessionData, setSessionData] = useState<SessionDetailsData | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [teamsWithPlayers, setTeamsWithPlayers] = useState<TeamWithPlayers[]>([])
  const [lockedPlayers, setLockedPlayers] = useState<Set<string>>(new Set())

  const togglePlayer = (player: Player) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(player.id)) next.delete(player.id)
      else next.add(player.id)
      return next
    })
  }

  const buildTeams = (data: SessionDetailsData) => {
    const selected = allPlayers.filter(p => selectedIds.has(p.id))
    const sessionId = generateId()
    const teamNames = Array.from({ length: data.num_teams }, (_, i) => `Team ${String.fromCharCode(65 + i)}`)
    const teamColors = DEFAULT_COLORS.slice(0, data.num_teams)

    const lockedMap = new Map<string, string>()
    if (teamsWithPlayers.length > 0) {
      for (const t of teamsWithPlayers) {
        for (const p of t.assignedPlayers) {
          if (lockedPlayers.has(p.id)) lockedMap.set(p.id, t.id)
        }
      }
    }

    const { teams, teamPlayers } = balanceTeams(selected, data.num_teams, teamNames, teamColors, sessionId, lockedMap)
    return { teams, teamPlayers, sessionId }
  }

  const handleDetailsNext = (data: SessionDetailsData) => {
    setSessionData(data)
    setStep(2)
  }

  const handlePlayersNext = () => {
    if (!sessionData) return
    const { teams, teamPlayers } = buildTeams(sessionData)
    const tWP: TeamWithPlayers[] = teams.map((team, i) => ({
      ...team,
      assignedPlayers: teamPlayers[i]?.players || [],
    }))
    setTeamsWithPlayers(tWP)
    setStep(3)
  }

  const handleReshuffle = () => {
    if (!sessionData) return
    const { teams, teamPlayers } = buildTeams(sessionData)
    const tWP: TeamWithPlayers[] = teams.map((team, i) => ({
      ...team,
      assignedPlayers: teamPlayers[i]?.players || [],
    }))
    setTeamsWithPlayers(tWP)
  }

  const handleConfirm = () => {
    if (!sessionData) return
    const now = new Date().toISOString()
    const sessionId = teamsWithPlayers[0]?.session_id || generateId()

    const session: Session = {
      id: sessionId,
      name: sessionData.name,
      date: sessionData.date,
      location: sessionData.location,
      session_duration: sessionData.session_duration,
      match_duration: sessionData.match_duration,
      break_duration: sessionData.break_duration,
      num_teams: sessionData.num_teams,
      status: 'active',
      created_at: now,
      updated_at: now,
    }

    // Attach players to teams
    const teams: Team[] = teamsWithPlayers.map(t => ({
      id: t.id,
      session_id: t.session_id,
      name: t.name,
      color: t.color,
      players: t.assignedPlayers.map(p => ({
        id: generateId(),
        team_id: t.id,
        player_id: p.id,
        player: p,
      })),
    }))

    const { matches } = generateSchedule(
      teams,
      sessionData.session_duration,
      sessionData.match_duration,
      sessionData.break_duration,
      sessionId
    )

    const selectedPlayers = allPlayers.filter(p => selectedIds.has(p.id))

    setSession(session)
    setPlayers(selectedPlayers)
    setTeams(teams)
    setMatches(matches)

    router.push(`/sessions/${sessionId}`)
  }

  const steps = ['Details', 'Players', 'Teams']

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              i + 1 < step ? 'bg-emerald-500 text-white' :
              i + 1 === step ? 'bg-emerald-500 text-white' :
              'bg-gray-800 text-gray-500'
            }`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i + 1 === step ? 'text-white' : 'text-gray-500'}`}>{label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-emerald-500' : 'bg-gray-800'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <SessionDetailsStep defaultValues={sessionData || undefined} onNext={handleDetailsNext} />
      )}
      {step === 2 && sessionData && (
        <PlayerSelectionStep
          players={allPlayers}
          selectedIds={selectedIds}
          onToggle={togglePlayer}
          onNext={handlePlayersNext}
          onBack={() => setStep(1)}
          numTeams={sessionData.num_teams}
        />
      )}
      {step === 3 && (
        <TeamSetupStep
          teams={teamsWithPlayers}
          lockedPlayers={lockedPlayers}
          onTeamsChange={setTeamsWithPlayers}
          onToggleLock={(id) => setLockedPlayers(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })}
          onReshuffle={handleReshuffle}
          onConfirm={handleConfirm}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  )
}
