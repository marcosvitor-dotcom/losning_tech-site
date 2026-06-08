import { GlowBlob } from "@/components/motion/GlowBlob"
import { Reveal } from "@/components/motion/Reveal"
import { cn } from "@/lib/utils"

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  accent?: "teal" | "accent"
  children?: React.ReactNode
}

export function PageHero({ eyebrow, title, subtitle, accent = "teal", children }: PageHeroProps) {
  return (
    <section className="lt-gradient-hero relative overflow-hidden">
      <GlowBlob
        className="-left-20 top-0 h-80 w-80 opacity-25"
        color={accent === "accent" ? "var(--lt-accent)" : "var(--lt-teal)"}
      />
      <GlowBlob className="right-0 top-20 h-72 w-72 opacity-20" color="var(--lt-royal)" />
      <div className="container relative pb-16 pt-36 md:pb-20 md:pt-44">
        <Reveal className="max-w-3xl">
          <span className={cn("lt-badge lt-badge-light", accent === "accent" && "")}>{eyebrow}</span>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.12] text-white md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{subtitle}</p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </div>
    </section>
  )
}
