'use client'

import { useEffect, useState } from 'react'

// Global in-memory cache store
const memoryCache = new Map<string, { data: any; timestamp: number }>()

export function useCachedData<T>(url: string, initialData: T | null = null, ttlMs: number = 60000) {
  const cached = memoryCache.get(url)
  const [data, setData] = useState<T | null>(cached ? cached.data : initialData)
  const [loading, setLoading] = useState<boolean>(!cached)

  useEffect(() => {
    let isMounted = true

    // Function to revalidate data in background
    const fetchData = async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) return
        const freshData = await res.json()
        memoryCache.set(url, { data: freshData, timestamp: Date.now() })
        if (isMounted) {
          setData(freshData)
          setLoading(false)
        }
      } catch (err) {
        console.error(`Error fetching cached URL ${url}:`, err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const currentCached = memoryCache.get(url)
    const isExpired = !currentCached || Date.now() - currentCached.timestamp > ttlMs

    if (currentCached) {
      setData(currentCached.data)
      setLoading(false)
    }

    if (isExpired) {
      fetchData()
    }
  }, [url, ttlMs])

  const mutate = (newData: T) => {
    memoryCache.set(url, { data: newData, timestamp: Date.now() })
    setData(newData)
  }

  return { data, loading, mutate }
}

// Function to invalidate cache manually (e.g. after mutations/edits)
export function invalidateCache(url?: string) {
  if (url) {
    memoryCache.delete(url)
  } else {
    memoryCache.clear()
  }
}
