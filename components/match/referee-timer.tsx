'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatTime } from '@/lib/utils'
import { useSessionStore } from '@/stores/session-store'
import { cn } from '@/lib/utils'

interface RefereeTimerProps {
  matchId: string
  onTimeUp: () => void
}

export function RefereeTimer({ matchId, onTimeUp }: RefereeTimerProps) {
  const { timerState, pauseTimer, resumeTimer } = useSessionStore()
  const [displaySeconds, setDisplaySeconds] = useState(timerState?.remaining || 0)
  const [hasEnded, setHasEnded] = useState(false)

  const computeRemaining = useCallback(() => {
    if (!timerState) return 0
    if (!timerState.is_running) return timerState.remaining
    const elapsed = (Date.now() - (timerState.start_timestamp || Date.now())) / 1000
    return Math.max(0, timerState.duration - elapsed)
  }, [timerState])

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = computeRemaining()
      setDisplaySeconds(remaining)
      if (remaining <= 0 && !hasEnded) {
        setHasEnded(true)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
        onTimeUp()
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [computeRemaining, hasEnded, onTimeUp])

  const percentage = timerState ? (displaySeconds / timerState.duration) * 100 : 100
  const isRunning = timerState?.is_running || false
  const isWarning = displaySeconds < 60 && displaySeconds > 0
  const isDanger = displaySeconds < 30 && displaySeconds > 0

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-6xl font-bold tabular-nums leading-none',
            isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
          )}>
            {formatTime(Math.ceil(displaySeconds))}
          </span>
          <span className="text-gray-500 text-sm mt-1">{isRunning ? 'running' : 'paused'}</span>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => isRunning ? pauseTimer() : resumeTimer()}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg',
          isRunning ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-emerald-500 hover:bg-emerald-400'
        )}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  )
}
