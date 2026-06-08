import { Mail, Phone, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/forms/ContactForm"
import { Reveal } from "@/components/motion/Reveal"
import { GlowBlob } from "@/components/motion/GlowBlob"
import { company } from "@/lib/data/company"

const quickLinks = [
  { icon: Mail, label: company.email, href: `mailto:${company.email}` },
  { icon: Phone, label: company.phone, href: `tel:+${company.phoneRaw}` },
  { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${company.phoneRaw}` },
]

export function CTAContact() {
  return (
    <section id="contato" className="relative overflow-hidden py-20 md:py-28">
      <div className="lt-gradient-brand absolute inset-0" />
      <GlowBlob className="-right-24 -top-24 h-80 w-80 opacity-30" color="var(--lt-teal-bright)" />
      <GlowBlob className="-bottom-28 -left-20 h-80 w-80 opacity-20" color="#fff" />

      <div className="container relative grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
        {/* Pitch */}
        <Reveal>
          <span className="lt-badge lt-badge-light">Vamos conversar</span>
          <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
            Vamos potencializar o seu BI?
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
            Conte o seu desafio. Nossa equipe técnica e comercial responde rápido —
            geralmente no mesmo dia útil. Sem compromisso.
          </p>

          <div className="mt-8 space-y-3">
            {quickLinks.map((q) => {
              const Icon = q.icon
              return (
                <a
                  key={q.label}
                  href={q.href}
                  target={q.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/85 transition-opacity hover:opacity-80"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon size={16} />
                  </span>
                  {q.label}
                </a>
              )
            })}
          </div>
        </Reveal>

        {/* Formulário */}
        <Reveal delay={0.12}>
          <div className="rounded-2xl bg-white p-7 shadow-2xl md:p-8">
            <h3 className="font-heading text-xl font-bold text-[var(--lt-ink)]">
              Envie sua mensagem
            </h3>
            <p className="mt-1.5 text-sm text-[var(--lt-muted)]">
              Preencha e retornaremos em breve.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
