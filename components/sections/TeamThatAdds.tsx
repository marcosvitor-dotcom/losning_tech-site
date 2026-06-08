import { Database, FolderCog, BarChart4 } from "lucide-react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

const roles = [
  {
    icon: Database,
    title: "Extração",
    desc: "Profissionais dedicados à integração e extração de dados de todas as plataformas de mídia.",
  },
  {
    icon: FolderCog,
    title: "Tratamento",
    desc: "Especialistas em normalização, limpeza e modelagem de dados para garantir consistência total.",
  },
  {
    icon: BarChart4,
    title: "Visualização",
    desc: "Designers de dados focados em dashboards claros, com métricas como ROAS, CAC, CPL e frequência.",
  },
]

export function TeamThatAdds() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Um time que soma à sua equipe"
          title="Não viemos substituir o seu time — viemos agregar"
          subtitle="Agregamos expertise especializada e libertamos a sua equipe do operacional."
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon
            return (
              <RevealItem key={r.title}>
                <div className="lt-card h-full p-8">
                  <span className="lt-icon-badge">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-bold text-[var(--lt-ink)]">{r.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--lt-muted)]">{r.desc}</p>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
