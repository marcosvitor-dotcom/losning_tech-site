import { Shuffle, FileWarning, Clock } from "lucide-react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

const pains = [
  {
    icon: Shuffle,
    title: "Dados espalhados",
    desc: "Meta, Google Ads, GA4, TikTok… cada plataforma num lugar diferente, sem visão unificada.",
  },
  {
    icon: FileWarning,
    title: "Relatórios manuais",
    desc: "Horas toda semana copiando, colando e formatando — trabalho que deveria ser estratégia.",
  },
  {
    icon: Clock,
    title: "Erros e atrasos",
    desc: "Processos manuais geram inconsistências, retrabalho e entregas fora do prazo.",
  },
]

export function PainPoints() {
  return (
    <section className="lt-section-muted py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="O problema"
          title="Quanto tempo sua equipe perde com dados?"
          subtitle="E se tudo isso rodasse sozinho?"
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {pains.map((p) => {
            const Icon = p.icon
            return (
              <RevealItem key={p.title}>
                <div className="lt-card h-full p-7">
                  <span className="lt-icon-badge lt-icon-badge-blue">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-bold text-[var(--lt-ink)]">{p.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--lt-muted)]">{p.desc}</p>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
