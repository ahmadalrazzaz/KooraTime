'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean
  backHref?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, back, backHref, action }: PageHeaderProps) {
  const router = useRouter()
  return (
    <header className="flex items-center gap-3 px-4 py-4">
      {back && (
        <button
          onClick={() => backHref ? router.push(backHref) : router.back()}
          className="p-2 hover:bg-gray-800 rounded-xl"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
