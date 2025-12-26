import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Butik Katarina Budva | Virtuelno Probavanje',
  description: 'Ekskluzivna kolekcija odjeće sa mogućnošću virtuelnog probavanja. Butik Katarina Budva.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(201, 168, 108, 0.3)',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
