import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { dashboards } from "@/lib/data/dashboards"
import { DashboardCard } from "@/components/portfolio/DashboardCard"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"

export function PortfolioPreview() {
  return (
    <section className="lt-section-muted py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Portfólio"
          title="Dashboards que já estão no ar"
          subtitle="Exemplos reais de produtos de BI entregues pela Losning — do executivo resumido ao painel multi-canal completo."
        />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2">
          {dashboards.map((d) => (
            <RevealItem key={d.slug}>
              <DashboardCard dashboard={d} />
            </RevealItem>
          ))}
        </RevealGroup>
        <div className="mt-10 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--lt-teal)] hover:gap-2.5"
          >
            Ver portfólio completo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
