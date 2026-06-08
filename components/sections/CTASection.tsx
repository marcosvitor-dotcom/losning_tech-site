import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Reveal } from "@/components/motion/Reveal"
import { GlowBlob } from "@/components/motion/GlowBlob"

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
}

export function CTASection({
  title = "Vamos potencializar o seu BI?",
  subtitle = "Inteligência de dados que melhora, automatiza e economiza a operação da sua agência.",
  primaryLabel = "Falar com a Losning",
  primaryHref = "/contato",
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="lt-gradient-brand absolute inset-0" />
      <GlowBlob className="-right-20 -top-20 h-72 w-72 opacity-30" color="var(--lt-teal-bright)" />
      <GlowBlob className="-bottom-24 -left-16 h-72 w-72 opacity-20" color="#fff" />
      <div className="container relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="light">
              <Link href={primaryHref}>
                {primaryLabel} <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/70 text-white hover:bg-white hover:text-[var(--lt-navy)]">
              <Link href="/portfolio">Ver portfólio</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
