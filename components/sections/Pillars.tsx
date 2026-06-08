import { TrendingUp, Zap, PiggyBank } from "lucide-react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

const pillars = [
  {
    icon: TrendingUp,
    title: "Melhorar",
    desc: "Dashboards com a identidade do cliente, sempre atualizados e com mais valor percebido.",
  },
  {
    icon: Zap,
    title: "Automatizar",
    desc: "Extração, tratamento e entrega de dados, com conectores para todos os veículos de mídia.",
  },
  {
    icon: PiggyBank,
    title: "Economizar",
    desc: "Mais expertise sem expandir a folha de pagamento. Escala sem custo fixo.",
  },
]

export function Pillars() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Como entregamos"
          title="Melhor entrega e zero trabalho manual andam juntos"
          subtitle="Transformamos dados de mídia em entregas prontas, automáticas e confiáveis."
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <RevealItem key={p.title}>
                <div className="lt-card-soft h-full p-8">
                  <span className="lt-icon-badge bg-white">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-[var(--lt-ink)]">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--lt-text)]">{p.desc}</p>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
