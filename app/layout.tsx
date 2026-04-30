import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/lib/providers/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas',
  description:
    'Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!',
  keywords: [
    'igreja',
    'batista',
    'vila canaan',
    'duque de caxias',
    'PIB',
    'cultos',
    'evangelica',
  ],
  authors: [{ name: 'PIB Vila Canaan' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://pibvilacanaan.com.br',
    siteName: 'PIB Vila Canaan',
    title: 'PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas',
    description:
      'Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PIB Vila Canaan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas',
    description:
      'Igreja Batista em Vila Canaan. Cultos aos domingos e quartas. Venha fazer parte da nossa família!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Root Layout — top-level application layout.
 *
 * The outermost layout, applied to EVERY page of the site. Contains
 * only the essentials shared across the whole app:
 * - HTML and body setup
 * - Global fonts (Geist Sans and Geist Mono)
 * - Providers (React contexts)
 * - Toaster for notifications
 *
 * The Navbar and Footer are owned by the (public) Route Group's
 * layout, so the admin panel can have its own layout without them.
 *
 * @see {@link file://./(public)/layout.tsx} Public-pages layout (with Navbar/Footer)
 * @see {@link file://./admin/layout.tsx} Admin-panel layout (with Sidebar)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
            toastOptions={{
              classNames: {
                icon: 'self-start mt-0.5',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
