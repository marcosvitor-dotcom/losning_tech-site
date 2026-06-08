import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { company } from "@/lib/data/company"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: "Losning Tech — Inteligência de dados, BI e software sob medida",
    template: "%s · Losning Tech",
  },
  description: company.tagline,
  keywords: [
    "Business Intelligence",
    "Engenharia de Dados",
    "Dashboards",
    "Automação de relatórios",
    "BI para agências",
    "Health Mind",
    "Losning Tech",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: company.siteUrl,
    siteName: company.name,
    title: "Losning Tech — Inteligência de dados, BI e software sob medida",
    description: company.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: "Losning Tech",
    description: company.tagline,
  },
  icons: { icon: "/favicon.png" },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  )
}
