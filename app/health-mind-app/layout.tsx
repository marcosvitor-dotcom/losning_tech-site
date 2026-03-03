import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './health-mind.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'Health Mind — Plataforma Completa de Saúde Mental',
  description: 'Health Mind conecta pacientes, psicólogos e clínicas em um único aplicativo seguro, intuitivo e com inteligência artificial. Cuidado com a saúde mental ao alcance de todos.',
  icons: {
    icon: '/health-mind-app/images/favicon.png',
    apple: '/health-mind-app/images/favicon.png',
  },
  openGraph: {
    title: 'Health Mind — Plataforma Completa de Saúde Mental',
    description: 'Conectamos pacientes, psicólogos e clínicas em um único aplicativo seguro e intuitivo.',
    images: ['/health-mind-app/images/health_capa_1024x500.png'],
  },
}

export default function HealthMindLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${playfair.variable} hm-body`}>
      {children}
    </div>
  )
}
