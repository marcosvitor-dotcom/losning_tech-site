import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

const steps = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Mapeamos seus clientes, fontes de dados, relatórios atuais e objetivos de entrega.",
  },
  {
    n: "02",
    title: "Setup & Integração",
    desc: "Configuramos conectores, pipelines e dashboards com a identidade do cliente.",
  },
  {
    n: "03",
    title: "Operação contínua",
    desc: "O time Losning mantém, atualiza e evolui sua estrutura de BI mês após mês.",
  },
]

export function HowItWorks() {
  return (
    <section className="lt-section-muted py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Como funciona a parceria"
          title="Modelo de assinatura, sem surpresas"
          subtitle="Setup, conectores e suporte inclusos. Onboarding rápido, operacional desde a primeira semana. Valor sob consulta, adaptado ao tamanho da sua agência."
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <RevealItem key={s.n}>
              <div className="lt-card h-full p-8">
                <span className="lt-stat lt-text-gradient text-4xl">{s.n}</span>
                <h3 className="mt-4 font-heading text-xl font-bold text-[var(--lt-ink)]">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--lt-muted)]">{s.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
