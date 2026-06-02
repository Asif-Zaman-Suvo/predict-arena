"use client"

import { supabase } from "@/src/lib/supabase/client"

export async function getAuthUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}
