import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react"
import { company } from "@/lib/data/company"

const sections = [
  {
    title: "Soluções",
    links: [
      { href: "/bi-dados", label: "BI & Engenharia de Dados" },
      { href: "/health-mind", label: "Health Mind" },
      { href: "/portfolio", label: "Portfólio & Cases" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/contato", label: "Fale conosco" },
      { href: "/portfolio", label: "Projetos sob demanda" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="lt-gradient-hero text-white">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo_lt_branca.png"
                alt=""
                width={62}
                height={42}
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-bold leading-none text-white">
                Losning Tech
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              {company.positioning}
            </p>
            <div className="lt-divider mt-6" />
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-body text-sm font-semibold uppercase tracking-wider text-white/90">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contato */}
          <div>
            <h3 className="font-body text-sm font-semibold uppercase tracking-wider text-white/90">
              Contato
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white">
                  <Mail size={15} className="shrink-0" /> {company.email}
                </a>
              </li>
              <li>
                <a href={`tel:+${company.phoneRaw}`} className="flex items-center gap-2 hover:text-white">
                  <Phone size={15} className="shrink-0" /> {company.phone}
                </a>
              </li>
              <li>
                <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                  <Linkedin size={15} className="shrink-0" /> {company.linkedin}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={15} className="shrink-0" /> {company.site}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0" /> {company.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-8 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. Todos os direitos reservados.
          </p>
          <p>
            CNPJ {company.cnpj} · D-U-N-S {company.duns}
          </p>
        </div>
      </div>
    </footer>
  )
}
