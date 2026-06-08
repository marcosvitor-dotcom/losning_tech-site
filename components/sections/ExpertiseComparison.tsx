import { Check, X } from "lucide-react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { Reveal } from "@/components/motion/Reveal"

const traditional = [
  "Processo de recrutamento demorado",
  "Meses de treino e integração",
  "Curva de aprendizado longa",
  "Um único profissional com escopo limitado",
  "Custo fixo elevado e risco de rotatividade",
]

const losning = [
  "Time especializado pronto desde o primeiro dia",
  "Integração imediata à operação da agência",
  "Expertise em extração, tratamento e visualização",
  "Escala conforme o crescimento da carteira",
  "Custo previsível e sem encargos trabalhistas",
]

export function ExpertiseComparison() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Mais expertise, sem expandir a folha"
          title="Contratar & treinar vs. parceria inteligente"
          subtitle="Você potencializa sua operação com um time especializado, mais rápido e mais econômico."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="lt-card h-full p-8">
              <span className="lt-badge lt-badge-blue">O caminho tradicional</span>
              <h3 className="mt-4 font-heading text-xl font-bold text-[var(--lt-ink)]">Contratar & treinar</h3>
              <ul className="mt-6 space-y-3">
                {traditional.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--lt-muted)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400">
                      <X size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="lt-card-navy h-full p-8">
              <span className="lt-badge lt-badge-light">Losning Tech</span>
              <h3 className="mt-4 font-heading text-xl font-bold text-white">A parceria inteligente</h3>
              <ul className="mt-6 space-y-3">
                {losning.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--lt-teal)]/30 text-[var(--lt-teal-bright)]">
                      <Check size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
