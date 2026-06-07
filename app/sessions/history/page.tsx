'use client'
import { useEffect, useState } from 'react'
import { loadHistory, deleteFromHistory } from '@/lib/local-storage'
import { LocalSession } from '@/types'
import { PageHeader } from '@/components/layout/page-header'
import { Navbar } from '@/components/layout/navbar'
import { formatDate } from '@/lib/utils'
import { Trash2, Calendar, Users, Trophy } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  const [history, setHistory] = useState<LocalSession[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
    setHistory(history.filter(s => s.session.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Session History" subtitle={`${history.length} sessions`} />

      <div className="px-4 space-y-3">
        {history.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500">No sessions yet</p>
            <p className="text-gray-600 text-sm mt-1">Completed sessions will appear here</p>
          </div>
        )}
        {history.map(({ session, matches, teams }) => {
          const finished = matches.filter(m => m.status === 'finished').length
          return (
            <div key={session.id} className="bg-gray-900 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{session.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(session.date)}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {teams.length} teams</span>
                    <span className="flex items-center gap-1"><Trophy size={10} /> {finished}/{matches.length} matches</span>
                  </div>
                  {session.location && (
                    <p className="text-xs text-gray-600 mt-1">📍 {session.location}</p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteId(session.id)}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: matches.length ? `${(finished / matches.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Session?">
        <p className="text-gray-400 mb-4">This will permanently remove the session from history.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId!)} className="flex-1">Delete</Button>
        </div>
      </Modal>

      <Navbar />
    </div>
  )
}
