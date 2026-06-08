import type { Metadata } from "next"
import { Mail, Phone, MapPin, Linkedin, Globe, Building2 } from "lucide-react"
import { PageHero } from "@/components/sections/PageHero"
import { ContactForm } from "@/components/forms/ContactForm"
import { Reveal } from "@/components/motion/Reveal"
import { company } from "@/lib/data/company"

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Losning Tech. Vamos potencializar o BI da sua agência ou conhecer o Health Mind.",
}

const contactItems = [
  { icon: Mail, label: "E-mail", value: company.email, href: `mailto:${company.email}` },
  { icon: Phone, label: "Telefone / WhatsApp", value: company.phone, href: `tel:+${company.phoneRaw}` },
  { icon: Linkedin, label: "LinkedIn", value: company.linkedin, href: company.linkedinUrl },
  { icon: Globe, label: "Site", value: company.site, href: company.siteUrl },
  { icon: MapPin, label: "Localização", value: company.city },
]

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title={<>Vamos potencializar o seu BI?</>}
        subtitle="Conte o seu desafio. Nossa equipe técnica e comercial responde rápido — geralmente no mesmo dia útil."
      />

      <section className="py-20 md:py-28">
        <div className="container grid gap-10 lg:grid-cols-[1fr_0.85fr]">
          {/* Formulário */}
          <Reveal>
            <div className="lt-card p-8">
              <h2 className="font-heading text-2xl font-bold text-[var(--lt-ink)]">Envie uma mensagem</h2>
              <p className="mt-2 text-sm text-[var(--lt-muted)]">
                Preencha o formulário e retornaremos em breve.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          {/* Dados corporativos */}
          <Reveal delay={0.1}>
            <div className="lt-card-navy h-full p-8">
              <h2 className="font-heading text-2xl font-bold text-white">Fale direto com a Losning</h2>
              <div className="lt-divider mt-5" />
              <ul className="mt-7 space-y-5">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <div className="flex items-start gap-3">
                      <span className="lt-icon-badge h-11 w-11 rounded-xl bg-white/10 text-white">
                        <Icon size={19} />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/55">{item.label}</p>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="block transition-opacity hover:opacity-80"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 rounded-xl bg-white/5 p-5">
                <div className="flex items-center gap-2 text-white/80">
                  <Building2 size={16} />
                  <span className="text-sm font-semibold">Dados da empresa</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/60">
                  {company.name}
                  <br />
                  CNPJ {company.cnpj}
                  <br />
                  D-U-N-S {company.duns}
                  <br />
                  {company.address}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
