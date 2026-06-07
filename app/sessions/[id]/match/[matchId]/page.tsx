'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/stores/session-store'
import { RefereeTimer } from '@/components/match/referee-timer'
import { ScoreTracker } from '@/components/match/score-tracker'
import { GoalForm } from '@/components/match/goal-form'
import { EventList } from '@/components/match/event-list'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Flag } from 'lucide-react'
import { MatchEvent } from '@/types'

export default function MatchPage({ params }: { params: { id: string; matchId: string } }) {
  const { id, matchId } = params
  const router = useRouter()
  const { session, matches, teams, players, events, startMatch, endMatch, addGoal, undoLastGoal, timerState } = useSessionStore()

  const match = matches.find(m => m.id === matchId)
  const teamA = teams.find(t => t.id === match?.team_a_id)
  const teamB = teams.find(t => t.id === match?.team_b_id)

  const [goalTeamId, setGoalTeamId] = useState<string | null>(null)
  const [showEndModal, setShowEndModal] = useState(false)
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)
  const [extraTime, setExtraTime] = useState(0)

  const matchEvents = events.filter(e => e.match_id === matchId)

  // Enrich events with player data
  const enrichedEvents = matchEvents.map(e => ({
    ...e,
    player: players.find(p => p.id === e.player_id),
    assister: players.find(p => p.id === e.assister_id),
  }))

  useEffect(() => {
    if (match?.status === 'pending' && session) {
      startMatch(matchId, session.match_duration)
    }
  }, [])

  const elapsedMinutes = match && timerState
    ? Math.floor((timerState.duration - timerState.remaining) / 60)
    : 0

  const handleGoal = (teamId: string) => {
    setGoalTeamId(teamId)
  }

  const handleGoalSubmit = (eventData: Omit<MatchEvent, 'id' | 'created_at'>) => {
    addGoal(eventData)
    setGoalTeamId(null)
  }

  const handleEndMatch = () => {
    endMatch(matchId)
    router.push(`/sessions/${id}`)
  }

  const handleTimeUp = () => {
    setShowTimeUpModal(true)
  }

  if (!match || !teamA || !teamB || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Match not found</p>
      </div>
    )
  }

  const goalTeam = goalTeamId ? teams.find(t => t.id === goalTeamId) : null
  const opposingTeam = goalTeamId === teamA.id ? teamB : teamA

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => router.push(`/sessions/${id}`)} className="p-2 hover:bg-gray-800 rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <span className="text-sm text-gray-400">Match {match.match_number}</span>
        </div>
        <button
          onClick={() => setShowEndModal(true)}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-gray-800"
        >
          <Flag size={14} /> End
        </button>
      </div>

      {/* Timer */}
      <div className="flex justify-center py-4">
        {match.status !== 'finished' && (
          <RefereeTimer matchId={matchId} onTimeUp={handleTimeUp} />
        )}
        {match.status === 'finished' && (
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-500">FT</div>
            <div className="text-gray-400 mt-1">Full Time</div>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="px-4 py-2">
        <ScoreTracker
          match={match}
          teamA={teamA}
          teamB={teamB}
          onGoal={match.status !== 'finished' ? handleGoal : () => {}}
        />
      </div>

      {/* Events */}
      <div className="flex-1 px-4 mt-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider">Goals</h3>
          {enrichedEvents.length > 0 && match.status !== 'finished' && (
            <button
              onClick={() => undoLastGoal(matchId)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Undo last
            </button>
          )}
        </div>
        <EventList events={enrichedEvents} teamA={teamA} teamB={teamB} />
      </div>

      {/* Bottom action */}
      {match.status !== 'finished' && (
        <div className="px-4 py-4 bg-gray-950 border-t border-gray-900">
          <Button variant="danger" onClick={() => setShowEndModal(true)} className="w-full">
            End Match
          </Button>
        </div>
      )}

      {/* Goal form modal */}
      <Modal
        open={!!goalTeamId && !!goalTeam}
        onClose={() => setGoalTeamId(null)}
        title={`Goal for ${goalTeam?.name}`}
      >
        {goalTeam && opposingTeam && (
          <GoalForm
            scoringTeam={goalTeam}
            opposingTeam={opposingTeam}
            allPlayers={players}
            teamAId={teamA.id}
            teamBId={teamB.id}
            matchId={matchId}
            minute={elapsedMinutes}
            onSubmit={handleGoalSubmit}
            onCancel={() => setGoalTeamId(null)}
          />
        )}
      </Modal>

      {/* End match confirmation */}
      <Modal open={showEndModal} onClose={() => setShowEndModal(false)} title="End Match?">
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl font-bold mb-2">
              {match.score_a} – {match.score_b}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <span style={{ color: teamA.color }}>{teamA.name}</span>
              <span className="text-gray-500">vs</span>
              <span style={{ color: teamB.color }}>{teamB.name}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm text-center">
            This will finalize the score and mark the match as complete.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowEndModal(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleEndMatch} className="flex-1">End Match</Button>
          </div>
        </div>
      </Modal>

      {/* Time up modal */}
      <Modal open={showTimeUpModal} onClose={() => setShowTimeUpModal(false)} title="Time Up!">
        <div className="space-y-4">
          <p className="text-center text-gray-300">Match time has ended. What would you like to do?</p>
          <div className="space-y-2">
            <Button variant="danger" onClick={() => { setShowTimeUpModal(false); setShowEndModal(true) }} className="w-full">
              End Match
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={extraTime}
                onChange={e => setExtraTime(Number(e.target.value))}
                className="input w-20 text-center"
                placeholder="5"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setShowTimeUpModal(false)
                  // Extra time logic would restart timer
                }}
                className="flex-1"
              >
                Add Extra Time
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
