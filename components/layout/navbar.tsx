'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, History, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/sessions/history', label: 'History', icon: History },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 1).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[56px]',
              pathname === href ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}

        <Link
          href="/sessions/new"
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white -mt-4 shadow-lg"
        >
          <Plus size={24} />
          <span className="text-xs font-semibold">New</span>
        </Link>

        {navItems.slice(1).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[56px]',
              pathname === href ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
