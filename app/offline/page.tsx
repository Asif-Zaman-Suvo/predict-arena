"use client"

import { Trophy, WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pitch-light">
        <WifiOff className="h-12 w-12 text-text-secondary" />
      </div>

      <h1 className="mb-4 text-3xl font-bold text-text-primary">
        You're Offline
      </h1>

      <p className="mb-8 max-w-md text-text-secondary">
        No internet connection detected. Some features may be limited. Check your connection and try again.
      </p>

      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-pitch-light">
        <Trophy className="h-8 w-8 text-text-secondary" />
      </div>

      <div className="space-y-2 text-sm text-text-tertiary">
        <p>While offline, you can still:</p>
        <ul className="list-disc list-inside">
          <li>View previously cached content</li>
          <li>Check your saved bracket</li>
          <li>Review past predictions</li>
        </ul>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
      >
        Try Again
      </button>
    </div>
  )
}