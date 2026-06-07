'use client'
import { use } from 'react'
import { useSessionStore } from '@/stores/session-store'
import { PageHeader } from '@/components/layout/page-header'
import { PlayerStatsCard } from '@/components/stats/player-stats-card'

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { session, computePlayerStats } = useSessionStore()
  const stats = computePlayerStats()

  if (!session || session.id !== id) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Session not found</p></div>
  }

  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="Player Stats" back backHref={`/sessions/${id}`} />
      <div className="px-4 space-y-2">
        {stats.length === 0 && (
          <p className="text-center text-gray-500 py-12">No stats yet. Play some matches!</p>
        )}
        {stats.map((s, i) => (
          <PlayerStatsCard key={s.player_id} stats={s} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
