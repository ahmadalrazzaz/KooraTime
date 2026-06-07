import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
          variant === 'primary' && 'bg-emerald-500 hover:bg-emerald-400 text-white',
          variant === 'secondary' && 'bg-gray-800 hover:bg-gray-700 text-white',
          variant === 'danger' && 'bg-red-600 hover:bg-red-500 text-white',
          variant === 'ghost' && 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white',
          size === 'sm' && 'py-2 px-3 text-sm',
          size === 'md' && 'py-3 px-6',
          size === 'lg' && 'py-4 px-8 text-lg',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
