'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Player, Position } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  skill_rating: z.number().min(1).max(5),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'flexible']).optional(),
  is_guest: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface PlayerFormProps {
  player?: Player
  onSubmit: (data: FormData) => void
  onCancel?: () => void
  loading?: boolean
}

const positions: Position[] = ['goalkeeper', 'defender', 'midfielder', 'forward', 'flexible']

export function PlayerForm({ player, onSubmit, onCancel, loading }: PlayerFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: player?.name || '',
      skill_rating: player?.skill_rating || 3,
      position: player?.position,
      is_guest: player?.is_guest || false,
    },
  })

  const skillRating = watch('skill_rating')
  const selectedPosition = watch('position')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        placeholder="Player name"
        error={errors.name?.message}
        {...register('name')}
      />

      <div>
        <label className="block text-sm text-gray-400 mb-2">Skill Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setValue('skill_rating', n)}
              className="p-2"
            >
              <Star
                size={28}
                className={cn(
                  n <= skillRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Position (optional)</label>
        <div className="flex flex-wrap gap-2">
          {positions.map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => setValue('position', selectedPosition === pos ? undefined : pos)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors',
                selectedPosition === pos
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" {...register('is_guest')} className="w-5 h-5 accent-emerald-500" />
        <span className="text-sm text-gray-300">Guest player (not in my roster)</span>
      </label>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : player ? 'Update Player' : 'Add Player'}
        </Button>
      </div>
    </form>
  )
}
