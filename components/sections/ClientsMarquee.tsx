import Image from "next/image"
import { clients } from "@/lib/data/clients"

export function ClientsMarquee({ title = "Parceiros que já escalamos" }: { title?: string }) {
  // Cada "metade" repete a lista o suficiente para ultrapassar a largura
  // da tela; o trilho são duas metades idênticas e a animação desloca
  // exatamente uma metade (-50%), criando um loop infinito sem emendas.
  const half = [...clients, ...clients, ...clients]
  const row = [...half, ...half]
  return (
    <section className="border-y border-[var(--lt-border)] bg-white py-12">
      <div className="container">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lt-muted)]">
          {title} · <span className="text-[var(--lt-teal)]">+30 marcas</span>
        </p>
      </div>
      <div className="lt-marquee group relative mt-8 overflow-hidden">
        {/* máscaras laterais */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
        <div className="lt-marquee-track">
          {row.map((client, i) => (
            <div key={`${client.name}-${i}`} className="flex w-44 shrink-0 items-center justify-center px-6">
              <Image
                src={client.logo}
                alt={client.alt}
                width={140}
                height={48}
                className="h-10 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
