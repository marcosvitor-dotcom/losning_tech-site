import type { Metadata } from "next"
import { Check } from "lucide-react"
import { PageHero } from "@/components/sections/PageHero"
import { DashboardCard } from "@/components/portfolio/DashboardCard"
import { ClientsMarquee } from "@/components/sections/ClientsMarquee"
import { CTASection } from "@/components/sections/CTASection"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { dashboards, onDemandServices } from "@/lib/data/dashboards"

export const metadata: Metadata = {
  title: "Portfólio & Cases",
  description:
    "Dashboards de BI no ar e projetos sob demanda da Losning Tech: sites, apps, automações, integrações via API e soluções com IA.",
}

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio & Cases"
        title={
          <>
            Resultados que você pode{" "}
            <span className="lt-text-gradient-light">explorar ao vivo.</span>
          </>
        }
        subtitle="Dashboards reais publicados e projetos sob demanda — uma amostra do que a Losning Tech entrega em dados e desenvolvimento."
      />

      {/* Dashboards */}
      <section className="py-20 md:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Dashboards no ar"
            title="Business Intelligence em produção"
            subtitle="Abra os painéis diretamente ou veja a pré-visualização ao vivo sem sair do site."
          />
          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2">
            {dashboards.map((d) => (
              <RevealItem key={d.slug}>
                <DashboardCard dashboard={d} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Projetos sob demanda */}
      <section className="lt-section-muted py-20 md:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Escalabilidade & projetos sob demanda"
            title="Além do BI, desenvolvemos sob medida"
            subtitle="Cada demanda é analisada individualmente pelo nosso time técnico e comercial, considerando complexidade, escopo, prazo e integrações. Assim garantimos uma entrega justa, personalizada e escalável."
          />
          <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {onDemandServices.map((s) => (
              <RevealItem key={s.title}>
                <div className="lt-card flex h-full items-center gap-3 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--lt-teal-pale)] text-[var(--lt-teal)]">
                    <Check size={16} />
                  </span>
                  <span className="text-sm font-medium text-[var(--lt-ink)]">{s.title}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <ClientsMarquee />
      <CTASection
        title="Tem um projeto em mente?"
        subtitle="Conte o seu desafio — montamos a solução de dados ou o produto digital sob medida."
        primaryLabel="Conversar sobre meu projeto"
      />
    </>
  )
}
