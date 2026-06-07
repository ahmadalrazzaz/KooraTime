import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-gray-700 text-gray-300',
        variant === 'success' && 'bg-emerald-900 text-emerald-300',
        variant === 'warning' && 'bg-yellow-900 text-yellow-300',
        variant === 'danger' && 'bg-red-900 text-red-300',
        variant === 'info' && 'bg-blue-900 text-blue-300',
        className
      )}
      {...props}
    />
  )
}
