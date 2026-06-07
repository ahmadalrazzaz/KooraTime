'use client'
import Link from 'next/link'
import { useSessionStore } from '@/stores/session-store'
import { Navbar } from '@/components/layout/navbar'
import { MatchCard } from '@/components/match/match-card'
import { Trophy, Users, History, Plus, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function HomePage() {
  const { session, matches, teams } = useSessionStore()

  const finishedMatches = matches.filter(m => m.status === 'finished').length
  const totalMatches = matches.length

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚽</span>
          <h1 className="text-2xl font-bold text-emerald-400">KooraTime</h1>
        </div>
        <p className="text-gray-500 text-sm">Your football session manager</p>
      </div>

      {/* Active Session */}
      {session ? (
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-emerald-300" />
                  <span className="text-sm text-emerald-300 font-medium">Active Session</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{session.name}</h2>
                <p className="text-emerald-300 text-sm">{formatDate(session.date)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{finishedMatches}/{totalMatches}</div>
                <div className="text-xs text-emerald-300">matches done</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: totalMatches ? `${(finishedMatches / totalMatches) * 100}%` : '0%' }}
              />
            </div>

            <div className="flex gap-2">
              <Link
                href={`/sessions/${session.id}`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-center text-sm transition-colors"
              >
                View Schedule
              </Link>
              <Link
                href={`/sessions/${session.id}/standings`}
                className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold py-2 px-4 rounded-xl text-center text-sm transition-colors"
              >
                Standings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-800 border-dashed">
            <div className="text-4xl mb-3">⚽</div>
            <h2 className="font-semibold mb-1">No Active Session</h2>
            <p className="text-gray-500 text-sm mb-4">Start a new session to track your matches</p>
            <Link href="/sessions/new" className="btn-primary inline-block">
              New Session
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/sessions/new" className="bg-gray-900 hover:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center">
              <Plus size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-medium text-sm">New Session</div>
              <div className="text-xs text-gray-500">Start playing</div>
            </div>
          </Link>
          <Link href="/players" className="bg-gray-900 hover:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-sm">Players</div>
              <div className="text-xs text-gray-500">Manage roster</div>
            </div>
          </Link>
          <Link href="/sessions/history" className="bg-gray-900 hover:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center">
              <History size={20} className="text-purple-400" />
            </div>
            <div>
              <div className="font-medium text-sm">History</div>
              <div className="text-xs text-gray-500">Past sessions</div>
            </div>
          </Link>
          {session && (
            <Link href={`/sessions/${session.id}/stats`} className="bg-gray-900 hover:bg-gray-800 rounded-2xl p-4 flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-yellow-900 flex items-center justify-center">
                <Trophy size={20} className="text-yellow-400" />
              </div>
              <div>
                <div className="font-medium text-sm">Stats</div>
                <div className="text-xs text-gray-500">Player stats</div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Next match */}
      {session && (
        <div className="px-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Next Up</h3>
          {matches.filter(m => m.status !== 'finished').slice(0, 2).map(match => (
            <div key={match.id} className="mb-2">
              <MatchCard match={match} sessionId={session.id} />
            </div>
          ))}
          {matches.filter(m => m.status !== 'finished').length === 0 && (
            <p className="text-gray-600 text-sm text-center py-4">All matches complete!</p>
          )}
        </div>
      )}

      <Navbar />
    </div>
  )
}
