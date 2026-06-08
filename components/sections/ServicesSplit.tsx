import Link from "next/link"
import { ArrowRight, BarChart3, Brain, Check } from "lucide-react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

const verticals = [
  {
    icon: BarChart3,
    badge: "Para agências e veículos de mídia",
    title: "BI & Engenharia de Dados",
    desc: "Centralizamos suas fontes, automatizamos a extração e entregamos dashboards com a identidade do cliente — sempre atualizados.",
    bullets: [
      "Dashboards estratégicos e em tempo real",
      "Pipelines e automação de relatórios",
      "Conectores com todos os veículos de mídia",
    ],
    href: "/bi-dados",
    cta: "Conhecer BI & Dados",
    accent: "teal" as const,
  },
  {
    icon: Brain,
    badge: "Produto próprio",
    title: "Health Mind",
    desc: "Sistema completo para psicologia: prontuário, agenda, financeiro e gestão de pacientes — com assistente de IA e conformidade.",
    bullets: [
      "Plataforma SaaS pronta para uso",
      "Agenda, prontuário e financeiro integrados",
      "Tecnologia própria com IA",
    ],
    href: "/health-mind",
    cta: "Conhecer Health Mind",
    accent: "accent" as const,
  },
]

export function ServicesSplit() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Duas frentes, uma só engenharia"
          title="O que a Losning Tech faz"
          subtitle="Unimos Business Intelligence, automação, engenharia de dados e Inteligência Artificial — atuando como braço estratégico e operacional dos nossos clientes."
        />

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2">
          {verticals.map((v) => {
            const Icon = v.icon
            return (
              <RevealItem key={v.title}>
                <div className="lt-card group flex h-full flex-col p-8">
                  <span className={`lt-icon-badge ${v.accent === "accent" ? "lt-icon-badge-accent" : ""}`}>
                    <Icon size={24} />
                  </span>
                  <span className={`lt-badge mt-6 self-start ${v.accent === "accent" ? "lt-badge-accent" : ""}`}>
                    {v.badge}
                  </span>
                  <h3 className="mt-4 font-heading text-2xl font-bold text-[var(--lt-ink)]">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--lt-muted)]">{v.desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {v.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-[var(--lt-text)]">
                        <Check size={17} className="mt-0.5 shrink-0 text-[var(--lt-teal)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={v.href}
                    className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--lt-teal)] transition-all group-hover:gap-2.5"
                  >
                    {v.cta} <ArrowRight size={16} />
                  </Link>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
