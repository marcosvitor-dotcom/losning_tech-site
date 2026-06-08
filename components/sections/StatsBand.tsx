import { stats } from "@/lib/data/company"
import { RevealGroup, RevealItem } from "@/components/motion/Reveal"
import { cn } from "@/lib/utils"

export function StatsBand({ dark = false }: { dark?: boolean }) {
  return (
    <section className={cn("py-16 md:py-20", dark ? "lt-gradient-hero" : "lt-section-muted")}>
      <div className="container">
        <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <RevealItem key={stat.label} className="text-center">
              <p className={cn("lt-stat text-5xl md:text-6xl", dark ? "lt-text-gradient-light" : "lt-text-gradient")}>
                {stat.value}
              </p>
              <p className={cn("mt-3 text-sm font-semibold", dark ? "text-white" : "text-[var(--lt-ink)]")}>
                {stat.label}
              </p>
              <p className={cn("mt-1.5 text-xs leading-relaxed", dark ? "text-white/60" : "text-[var(--lt-muted)]")}>
                {stat.desc}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
