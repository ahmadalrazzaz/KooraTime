'use client'
import { Standing } from '@/types'

interface StandingsTableProps {
  standings: Standing[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return <p className="text-center text-gray-500 py-8">No matches completed yet</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 pr-2">#</th>
            <th className="text-left py-2 pr-2">Team</th>
            <th className="text-center py-2 px-1">P</th>
            <th className="text-center py-2 px-1">W</th>
            <th className="text-center py-2 px-1">D</th>
            <th className="text-center py-2 px-1">L</th>
            <th className="text-center py-2 px-1">GD</th>
            <th className="text-center py-2 px-1 font-bold text-white">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.team_id} className={`border-b border-gray-800/50 ${i === 0 ? 'font-semibold' : ''}`}>
              <td className="py-3 pr-2 text-gray-500">{i + 1}</td>
              <td className="py-3 pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.team.color }} />
                  <span className="truncate">{s.team.name}</span>
                </div>
              </td>
              <td className="text-center py-3 px-1 text-gray-400">{s.played}</td>
              <td className="text-center py-3 px-1 text-emerald-400">{s.wins}</td>
              <td className="text-center py-3 px-1 text-gray-400">{s.draws}</td>
              <td className="text-center py-3 px-1 text-red-400">{s.losses}</td>
              <td className="text-center py-3 px-1 text-gray-300">
                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
              </td>
              <td className="text-center py-3 px-1 font-bold text-white">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
