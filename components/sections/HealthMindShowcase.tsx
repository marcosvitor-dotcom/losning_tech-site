import Link from "next/link"
import { ArrowUpRight, Brain, Calendar, FileText, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Reveal } from "@/components/motion/Reveal"
import { GlowBlob } from "@/components/motion/GlowBlob"
import { company } from "@/lib/data/company"

const features = [
  { icon: Calendar, label: "Agenda online" },
  { icon: FileText, label: "Prontuário" },
  { icon: Brain, label: "Assistente de IA" },
  { icon: ShieldCheck, label: "Conformidade CFP" },
]

export function HealthMindShowcase() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="container">
        <div className="lt-card-navy relative overflow-hidden rounded-3xl p-8 md:p-14">
          <GlowBlob className="-right-16 -top-16 h-64 w-64 opacity-30" color="var(--lt-accent)" />
          <GlowBlob className="-bottom-20 left-10 h-64 w-64 opacity-20" color="var(--lt-teal-bright)" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <span className="lt-badge lt-badge-accent">Produto próprio</span>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
                Health Mind — tecnologia que cuida da{" "}
                <span className="lt-text-gradient-light">saúde mental.</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
                Um sistema completo para psicólogos e clínicas: prontuário, agenda,
                financeiro, gestão de pacientes e um assistente de IA — tudo numa
                única plataforma. Prova viva de que a Losning também constrói
                produtos digitais de ponta a ponta.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {features.map((f) => {
                  const Icon = f.icon
                  return (
                    <span key={f.label} className="lt-badge lt-badge-light">
                      <Icon size={13} /> {f.label}
                    </span>
                  )
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="light">
                  <a href={company.healthMindUrl} target="_blank" rel="noopener noreferrer">
                    Acessar Health Mind <ArrowUpRight size={16} />
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/60 text-white hover:bg-white hover:text-[var(--lt-navy)]">
                  <Link href="/health-mind">Saber mais</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal className="relative" delay={0.15}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                {/* barra de janela */}
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="ml-3 text-xs text-white/40">health-mind-app.com</span>
                </div>
                {/* mock de conteúdo */}
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <span className="lt-icon-badge lt-icon-badge-accent">
                      <Brain size={22} />
                    </span>
                    <div className="flex-1">
                      <div className="h-3 w-28 rounded-full bg-white/30" />
                      <div className="mt-2 h-2.5 w-40 rounded-full bg-white/15" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Sessões", "Pacientes", "Receita"].map((l) => (
                      <div key={l} className="rounded-xl bg-white/8 p-3">
                        <div className="h-2 w-10 rounded-full bg-white/25" />
                        <div className="mt-2 h-4 w-12 rounded-full bg-[var(--lt-teal-bright)]/60" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-xl bg-white/5 p-4">
                    {[80, 60, 70].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-full bg-[var(--lt-accent)]/40" />
                        <div className="h-2.5 rounded-full bg-white/15" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
