import type { Metadata } from "next"
import { ArrowUpRight, Calendar, FileText, CreditCard, Users, ShieldCheck, Brain } from "lucide-react"
import { PageHero } from "@/components/sections/PageHero"
import { HealthMindShowcase } from "@/components/sections/HealthMindShowcase"
import { CTASection } from "@/components/sections/CTASection"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { Button } from "@/components/ui/Button"
import { company } from "@/lib/data/company"

export const metadata: Metadata = {
  title: "Health Mind",
  description:
    "Health Mind: sistema completo para psicologia — prontuário, agenda, financeiro, gestão de pacientes e assistente de IA. Um produto Losning Tech.",
}

const features = [
  { icon: Calendar, title: "Agenda online", desc: "Agendamento inteligente, lembretes automáticos e gestão da rotina de atendimentos." },
  { icon: FileText, title: "Prontuário eletrônico", desc: "Registros clínicos organizados, seguros e acessíveis a qualquer momento." },
  { icon: CreditCard, title: "Financeiro integrado", desc: "Controle de receitas, pagamentos e relatórios financeiros da clínica." },
  { icon: Users, title: "Gestão de pacientes", desc: "Histórico completo, evolução e acompanhamento de cada paciente num só lugar." },
  { icon: Brain, title: "Assistente de IA", desc: "Apoio inteligente ao psicólogo, personalizado e integrado ao fluxo de trabalho." },
  { icon: ShieldCheck, title: "Segurança & conformidade", desc: "Dados protegidos e alinhados às exigências de privacidade e ao CFP." },
]

export default function HealthMindPage() {
  return (
    <>
      <PageHero
        eyebrow="Produto próprio · Health Mind"
        accent="accent"
        title={
          <>
            Tecnologia que cuida da{" "}
            <span className="lt-text-gradient-light">saúde mental.</span>
          </>
        }
        subtitle="Health Mind é o sistema completo para psicólogos e clínicas — prontuário, agenda, financeiro e gestão de pacientes, com assistente de IA. Desenvolvido de ponta a ponta pela Losning Tech."
      >
        <Button asChild variant="light">
          <a href={company.healthMindUrl} target="_blank" rel="noopener noreferrer">
            Acessar Health Mind <ArrowUpRight size={16} />
          </a>
        </Button>
      </PageHero>

      <section className="py-20 md:py-28">
        <div className="container">
          <SectionHeading
            eyebrow="O que é"
            title="Tudo o que uma clínica precisa, numa só plataforma"
            subtitle="Do primeiro agendamento ao acompanhamento clínico e financeiro — o Health Mind organiza a operação para o profissional focar no que importa: o cuidado."
          />
          <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <RevealItem key={f.title}>
                  <div className="lt-card h-full p-7">
                    <span className="lt-icon-badge lt-icon-badge-accent">
                      <Icon size={24} />
                    </span>
                    <h3 className="mt-5 font-heading text-lg font-bold text-[var(--lt-ink)]">{f.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--lt-muted)]">{f.desc}</p>
                  </div>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </section>

      <HealthMindShowcase />

      <CTASection
        title="Quer conhecer o Health Mind de perto?"
        subtitle="Agende uma demonstração e veja como a plataforma pode transformar a gestão da sua clínica."
        primaryLabel="Solicitar demonstração"
      />
    </>
  )
}
