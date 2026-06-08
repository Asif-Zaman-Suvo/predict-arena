declare module 'next-pwa' {
  import { NextConfig } from 'next'

  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    cacheStartUrl?: boolean
    dynamicStartUrl?: boolean
    reloadOnOnline?: boolean
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
}