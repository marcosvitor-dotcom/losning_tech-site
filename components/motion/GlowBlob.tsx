import { cn } from "@/lib/utils"

interface GlowBlobProps {
  className?: string
  color?: string
}

/** Mancha de brilho radial decorativa (puramente visual). */
export function GlowBlob({ className, color = "var(--lt-teal)" }: GlowBlobProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-3xl", className)}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  )
}
