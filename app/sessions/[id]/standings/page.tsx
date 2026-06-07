'use client'
import { useSessionStore } from '@/stores/session-store'
import { PageHeader } from '@/components/layout/page-header'
import { StandingsTable } from '@/components/standings/standings-table'

export default function StandingsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { session, computeStandings } = useSessionStore()
  const standings = computeStandings()

  if (!session || session.id !== id) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Session not found</p></div>
  }

  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="Standings" back backHref={`/sessions/${id}`} />
      <div className="px-4">
        <div className="bg-gray-900 rounded-2xl p-4">
          <StandingsTable standings={standings} />
        </div>
      </div>
    </div>
  )
}
