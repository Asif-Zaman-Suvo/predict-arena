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
