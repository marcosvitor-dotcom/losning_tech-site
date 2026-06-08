import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Layers, Cpu, MonitorCheck } from "lucide-react"
import { PageHero } from "@/components/sections/PageHero"
import { PainPoints } from "@/components/sections/PainPoints"
import { Pillars } from "@/components/sections/Pillars"
import { TeamThatAdds } from "@/components/sections/TeamThatAdds"
import { ExpertiseComparison } from "@/components/sections/ExpertiseComparison"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { StatsBand } from "@/components/sections/StatsBand"
import { ClientsMarquee } from "@/components/sections/ClientsMarquee"
import { CTASection } from "@/components/sections/CTASection"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "BI & Engenharia de Dados",
  description:
    "Dashboards, automação de relatórios e engenharia de dados para agências e veículos de mídia. Você conecta suas fontes, a Losning cuida do resto.",
}

const flow = [
  {
    icon: Layers,
    step: "Fontes de dados",
    desc: "Coleta e integração de todas as fontes relevantes: Meta, Google Ads, GA4, TikTok e mais.",
  },
  {
    icon: Cpu,
    step: "Processamento e automação",
    desc: "Automatização de fluxos para tratar e processar os dados com eficiência e consistência.",
  },
  {
    icon: MonitorCheck,
    step: "Dashboards e relatórios",
    desc: "Visualização dos dados e insights em painéis interativos com a identidade do cliente.",
  },
]

export default function BiDadosPage() {
  return (
    <>
      <PageHero
        eyebrow="BI & Engenharia de Dados"
        title={
          <>
            Transformamos dados de mídia em entregas{" "}
            <span className="lt-text-gradient-light">prontas e automáticas.</span>
          </>
        }
        subtitle="Você conecta suas fontes de dados. A Losning cuida de todo o resto: extração, tratamento, automação e entrega. O esforço do cliente é mínimo; o resultado é máximo."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="light">
            <Link href="/contato">
              Solicitar diagnóstico <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-white/60 text-white hover:bg-white hover:text-[var(--lt-navy)]">
            <Link href="/portfolio">Ver dashboards</Link>
          </Button>
        </div>
      </PageHero>

      <PainPoints />
      <Pillars />

      {/* Fluxo "Simples na prática" */}
      <section className="lt-section-muted py-20 md:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="Simples na prática"
            title="Você nos conecta. A gente cuida do resto."
          />
          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {flow.map((f, i) => {
              const Icon = f.icon
              return (
                <RevealItem key={f.step}>
                  <div className="lt-card relative h-full p-8">
                    <span className="absolute right-6 top-6 lt-stat text-3xl text-[var(--lt-teal-soft)]">
                      0{i + 1}
                    </span>
                    <span className="lt-icon-badge lt-icon-badge-blue">
                      <Icon size={24} />
                    </span>
                    <h3 className="mt-5 font-heading text-lg font-bold text-[var(--lt-ink)]">{f.step}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--lt-muted)]">{f.desc}</p>
                  </div>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </section>

      <TeamThatAdds />
      <StatsBand dark />
      <ExpertiseComparison />
      <HowItWorks />
      <ClientsMarquee title="Agências e veículos que confiam na Losning" />
      <CTASection />
    </>
  )
}
