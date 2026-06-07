'use client'
import Link from 'next/link'
import { Match } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: Match
  sessionId: string
  isCurrent?: boolean
}

const statusConfig = {
  pending: { label: 'Upcoming', variant: 'default' as const, icon: Clock },
  in_progress: { label: 'Live', variant: 'danger' as const, icon: Play },
  finished: { label: 'Done', variant: 'success' as const, icon: CheckCircle },
}

export function MatchCard({ match, sessionId, isCurrent }: MatchCardProps) {
  const config = statusConfig[match.status]
  const Icon = config.icon

  return (
    <Link href={`/sessions/${sessionId}/match/${match.id}`}>
      <div className={cn(
        'bg-gray-900 rounded-xl p-4 transition-all hover:bg-gray-800',
        isCurrent && 'ring-2 ring-emerald-500',
        match.status === 'in_progress' && 'animate-pulse-border'
      )}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">Match {match.match_number}</span>
          <Badge variant={config.variant}>
            <Icon size={10} className="mr-1" />
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-right">
            <div
              className="font-bold text-sm truncate"
              style={{ color: match.team_a?.color || '#fff' }}
            >
              {match.team_a?.name || 'Team A'}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg min-w-[60px] justify-center">
            <span className="text-xl font-bold">{match.score_a}</span>
            <span className="text-gray-600">–</span>
            <span className="text-xl font-bold">{match.score_b}</span>
          </div>

          <div className="flex-1">
            <div
              className="font-bold text-sm truncate"
              style={{ color: match.team_b?.color || '#fff' }}
            >
              {match.team_b?.name || 'Team B'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
