'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlayerStore } from '@/stores/player-store'

export function Providers({ children }: { children: React.ReactNode }) {
  const syncFromSupabase = usePlayerStore(s => s.syncFromSupabase)

  useEffect(() => {
    const supabase = createClient()
    // Sync on mount if already authed
    syncFromSupabase()
    // Sync again when auth state changes (e.g. after login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        syncFromSupabase()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
