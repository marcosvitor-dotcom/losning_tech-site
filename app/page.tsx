import { Hero } from "@/components/sections/Hero"
import { StatsBand } from "@/components/sections/StatsBand"
import { ServicesSplit } from "@/components/sections/ServicesSplit"
import { PainPoints } from "@/components/sections/PainPoints"
import { Pillars } from "@/components/sections/Pillars"
import { ClientsMarquee } from "@/components/sections/ClientsMarquee"
import { PortfolioPreview } from "@/components/sections/PortfolioPreview"
import { HealthMindShowcase } from "@/components/sections/HealthMindShowcase"
import { CTAContact } from "@/components/sections/CTAContact"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientsMarquee />
      <StatsBand />
      <ServicesSplit />
      <PainPoints />
      <Pillars />
      <PortfolioPreview />
      <HealthMindShowcase />
      <CTAContact />
    </>
  )
}
