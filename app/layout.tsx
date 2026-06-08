import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/src/components/layout/SiteHeader"
import { SiteFooter } from "@/src/components/layout/SiteFooter"
import { PageWrapper } from "@/src/components/layout/PageWrapper"
import { AppProviders } from "@/src/components/providers/AppProviders"
import { AuthProvider } from "@/src/contexts/AuthContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Predictor",
  description: "Predict match scores and build your perfect World Cup 2026 bracket.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "World Cup Predictor",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "World Cup Predictor",
    title: "FIFA World Cup 2026 Predictor",
    description: "Predict match scores and build your perfect World Cup 2026 bracket.",
  },
  twitter: {
    card: "summary",
    title: "FIFA World Cup 2026 Predictor",
    description: "Predict match scores and build your perfect World Cup 2026 bracket.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
    ],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1628",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="World Cup Predictor" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="World Cup Predictor" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icons/icon-512x512.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/*
        bg-pitch sets --color-pitch (#0a1628) as the page background.
        The body stretches full height and stacks header → main → footer.
      */}
      <body className="flex min-h-full flex-col overflow-x-hidden bg-pitch text-foreground">
        <AuthProvider>
          <SiteHeader />

          <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6">
            <AppProviders>
              <PageWrapper>{children}</PageWrapper>
            </AppProviders>
          </main>

          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
