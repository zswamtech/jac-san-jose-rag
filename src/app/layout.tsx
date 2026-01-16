import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'JAC Barrio San José y El Bosque | Armenia, Quindío',
  description: 'Portal informativo de la Junta de Acción Comunal del Barrio San José y El Bosque en Armenia, Quindío. Directorio de negocios, eventos, trámites y más.',
  keywords: ['JAC', 'Barrio San José', 'El Bosque', 'Armenia', 'Quindío', 'Junta de Acción Comunal', 'Comunidad'],
  authors: [{ name: 'JAC San José y El Bosque' }],
  openGraph: {
    title: 'JAC Barrio San José y El Bosque',
    description: 'Tu comunidad en un solo lugar. Información, eventos y servicios del barrio.',
    type: 'website',
    locale: 'es_CO',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#228B22',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
