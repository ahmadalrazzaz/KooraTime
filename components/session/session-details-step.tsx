'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Timer, Coffee, Users } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Session name is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().optional(),
  session_duration: z.coerce.number().min(10, 'Min 10 min').max(300),
  match_duration: z.coerce.number().min(1, 'Min 1 min').max(60),
  break_duration: z.coerce.number().min(0).max(30),
  num_teams: z.coerce.number().min(2).max(8),
})

export type SessionDetailsData = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<SessionDetailsData>
  onNext: (data: SessionDetailsData) => void
}

export function SessionDetailsStep({ defaultValues, onNext }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, formState: { errors } } = useForm<SessionDetailsData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || `Session ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      date: defaultValues?.date || today,
      location: defaultValues?.location || '',
      session_duration: defaultValues?.session_duration || 90,
      match_duration: defaultValues?.match_duration || 15,
      break_duration: defaultValues?.break_duration || 5,
      num_teams: defaultValues?.num_teams || 2,
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <Input label="Session Name" error={errors.name?.message} {...register('name')} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
        <div>
          <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <MapPin size={12} /> Location
          </label>
          <input
            placeholder="e.g. City Park"
            className="input"
            {...register('location')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <Clock size={12} /> Total (min)
          </label>
          <input type="number" className="input" {...register('session_duration')} />
          {errors.session_duration && <p className="text-red-400 text-xs mt-1">{errors.session_duration.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <Timer size={12} /> Match (min)
          </label>
          <input type="number" className="input" {...register('match_duration')} />
          {errors.match_duration && <p className="text-red-400 text-xs mt-1">{errors.match_duration.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
            <Coffee size={12} /> Break (min)
          </label>
          <input type="number" className="input" {...register('break_duration')} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
          <Users size={12} /> Number of Teams
        </label>
        <input type="number" min={2} max={8} className="input" {...register('num_teams')} />
        {errors.num_teams && <p className="text-red-400 text-xs mt-1">{errors.num_teams.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-4">
        Next: Select Players
      </Button>
    </form>
  )
}
