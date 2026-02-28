import { Nunito, Pacifico, Quicksand } from 'next/font/google'
import './globals.css'
import DecoBackground from '@/components/DecoBackground'
import Navigation from '@/components/Navigation'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-main', weight: ['400', '600', '700', '800', '900'] })
const pacifico = Pacifico({ subsets: ['latin'], variable: '--font-title', weight: ['400'] })
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-soft', weight: ['400', '500', '600', '700'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} ${pacifico.variable} ${quicksand.variable} antialiased`}>
        <DecoBackground />
        <Navigation />
        <main className="main-content">
          <div className="section active">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
