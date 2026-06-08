import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/Reveal"

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "left" | "center"
  light?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center"
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        isCenter ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span className={cn("lt-badge mb-4", light && "lt-badge-light")}>{eyebrow}</span>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl font-bold leading-tight",
          light ? "text-white" : "text-[var(--lt-ink)]"
        )}
      >
        {title}
      </h2>
      <div className={cn("lt-divider mt-5", isCenter && "mx-auto")} />
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-base md:text-lg leading-relaxed",
            light ? "text-white/75" : "text-[var(--lt-muted)]"
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
