'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AttendanceEntry {
  id: string
  student_id: string
  checked_in_at: string
  profiles?: { full_name: string; avatar_url: string | null }
}

export function useRealtimeRoster(classId: string, initial: AttendanceEntry[]) {
  const [roster, setRoster] = useState<AttendanceEntry[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`attendance:${classId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance',
          filter: `class_id=eq.${classId}`,
        },
        async (payload) => {
          // Fetch full profile for the new attendance entry
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.student_id)
            .single()

          const entry: AttendanceEntry = {
            id: payload.new.id as string,
            student_id: payload.new.student_id as string,
            checked_in_at: payload.new.checked_in_at as string,
            profiles: data ?? undefined,
          }

          setRoster((prev) => {
            const exists = prev.some((a) => a.student_id === entry.student_id)
            if (exists) return prev
            return [entry, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classId])

  return roster
}
