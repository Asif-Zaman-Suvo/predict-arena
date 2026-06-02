"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/src/lib/supabase/client"

export function useCommunityDataDebug() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')

      console.log('Supabase predictions response:', data)
      console.log('First prediction structure:', data?.[0] ? Object.keys(data[0]) : 'No data')

      if (!error && data) {
        setPredictions(data)
      }
      setLoading(false)
    }

    fetchPredictions()
  }, [])

  return { predictions, loading }
}