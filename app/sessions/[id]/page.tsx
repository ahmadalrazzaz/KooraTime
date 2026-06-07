'use client'
import { use } from 'react'
import { useSessionStore } from '@/stores/session-store'
import { PageHeader } from '@/components/layout/page-header'
import { MatchCard } from '@/components/match/match-card'
import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { Trophy, BarChart3, MapPin, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { session, matches, teams } = useSessionStore()

  if (!session || session.id !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Session not found. <Link href="/" className="text-emerald-400">Go home</Link></p>
      </div>
    )
  }

  const finished = matches.filter(m => m.status === 'finished').length

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title={session.name} back backHref="/" />

      {/* Session info */}
      <div className="px-4 mb-4">
        <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock size={14} />
            <span>{formatDate(session.date)} · {session.session_duration} min total</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={14} />
              <span>{session.location}</span>
            </div>
          )}
          <div className="flex gap-4 text-sm mt-2">
            <div><span className="font-bold text-white">{finished}</span><span className="text-gray-500">/{matches.length} done</span></div>
            <div><span className="font-bold text-white">{session.match_duration}</span><span className="text-gray-500"> min/match</span></div>
            <div><span className="font-bold text-white">{teams.length}</span><span className="text-gray-500"> teams</span></div>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: matches.length ? `${(finished / matches.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 mb-4 flex gap-3">
        <Link
          href={`/sessions/${id}/standings`}
          className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <Trophy size={16} className="text-yellow-400" /> Standings
        </Link>
        <Link
          href={`/sessions/${id}/stats`}
          className="flex-1 bg-gray-900 hover:bg-gray-800 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <BarChart3 size={16} className="text-blue-400" /> Stats
        </Link>
      </div>

      {/* Match schedule */}
      <div className="px-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Schedule</h3>
        <div className="space-y-3">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} sessionId={id} />
          ))}
        </div>
        {matches.length === 0 && (
          <p className="text-center text-gray-600 py-8">No matches scheduled</p>
        )}
      </div>

      <Navbar />
    </div>
  )
}
