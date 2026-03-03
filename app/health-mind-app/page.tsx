"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const icons = {
  brain: "M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.13 7.59L16 21H8l-.87-2.41A9 9 0 0 1 3 11a9 9 0 0 1 9-9zm0 4c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7-4a4 4 0 0 0-4 4",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check: "M20 6L9 17l-5-5",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  building: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  sparkle: "M12 3l1.09 3.36L16.5 6l-2.59 2.5.77 3.5L12 10.35 9.32 12l.77-3.5L7.5 6l3.41-.64L12 3z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  menu: "M3 12h18M3 6h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  externalLink: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  play: "M5 3l14 9-14 9V3z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  video: "M23 7l-7 5 7 5V7z M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1V5z",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
}

// helper: scroll suave + ativar aba
function navigateToTab(tab: "psicologa" | "clinica" | "paciente") {
  window.dispatchEvent(new CustomEvent("hm-tab-change", { detail: tab }))
  const el = document.getElementById("audience-section")
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: "smooth" })
  }
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks: { tab?: "psicologa" | "clinica" | "paciente"; href: string; label: string }[] = [
    { tab: "psicologa", href: "#audience-section", label: "Para Psicólogas" },
    { tab: "clinica",   href: "#audience-section", label: "Para Clínicas" },
    { tab: "paciente",  href: "#audience-section", label: "Para Pacientes" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#recursos",  label: "Recursos" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, tab?: "psicologa" | "clinica" | "paciente", href?: string) => {
    if (tab) {
      e.preventDefault()
      navigateToTab(tab)
    }
    setMenuOpen(false)
    if (href && !tab) {
      const id = href.replace("#", "")
      const el = document.getElementById(id)
      if (el) {
        e.preventDefault()
        const y = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }
  }

  return (
    <nav className="hm-navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-3" style={{ textDecoration: 'none' }}
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <Image
              src="/health-mind-app/images/logo.png"
              alt="Health Mind"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="hm-heading font-bold text-lg" style={{ color: 'var(--hm-dark)' }}>
              Health Mind
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label, tab }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--hm-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--hm-rose)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--hm-text-muted)')}
                onClick={e => handleNavClick(e, tab, href)}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#contato" className="hm-btn-outline text-sm px-5 py-2"
              onClick={e => handleNavClick(e, undefined, "#contato")}>
              Fale conosco
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--hm-rose)' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen
                ? <><path d="M18 6L6 18M6 6l12 12" /></>
                : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t" style={{ borderColor: 'var(--hm-border)' }}>
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map(({ href, label, tab }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium py-2"
                  style={{ color: 'var(--hm-text)' }}
                  onClick={e => handleNavClick(e, tab, href)}
                >
                  {label}
                </a>
              ))}
              <a href="#contato" className="hm-btn-primary text-sm mt-2 justify-center"
                onClick={e => handleNavClick(e, undefined, "#contato")}>
                Fale conosco
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hm-gradient-hero pt-28 pb-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="hm-animate-fade-up">
            <div className="flex items-center gap-2 mb-6">
              <span className="hm-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.sparkle} />
                </svg>
                Assistente configurado pelo próprio psicólogo
              </span>
            </div>

            <h1 className="hm-heading text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight mb-6" style={{ color: 'var(--hm-dark)' }}>
              Cuidado com a mente,{" "}
              <span style={{ color: 'var(--hm-rose)' }}>na palma da mão</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--hm-text-muted)' }}>
              Health Mind é uma plataforma completa de saúde mental que conecta{" "}
              <strong style={{ color: 'var(--hm-text)' }}>pacientes, psicólogas e clínicas</strong>{" "}
              em um único aplicativo seguro, intuitivo e com suporte de IA 24 horas.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#para-psicologos" className="hm-btn-primary">
                Conheça o App
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.arrowRight} />
                </svg>
              </a>
              <a href="#contato" className="hm-btn-outline">
                Solicitar Demonstração
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-3">
              <span className="hm-security-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.shield} />
                </svg>
                Conforme LGPD
              </span>
              <span className="hm-security-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.lock} />
                </svg>
                Criptografia AES-256
              </span>
              <span className="hm-security-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons.check} />
                </svg>
                Res. CFP 11/2018
              </span>
            </div>
          </div>

          {/* Right — app preview card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl" style={{
                background: 'radial-gradient(ellipse at center, rgba(194,116,143,0.25) 0%, transparent 70%)',
                filter: 'blur(32px)',
                transform: 'scale(1.2)'
              }} />

              <div className="relative hm-card p-2 shadow-2xl hm-animate-float" style={{ maxWidth: 340, border: '1px solid rgba(194,116,143,0.2)' }}>
                <Image
                  src="/health-mind-app/images/health_capa_1024x500.png"
                  alt="Health Mind App"
                  width={640}
                  height={320}
                  className="rounded-2xl w-full h-auto"
                  priority
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 hm-card shadow-lg px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--hm-rose-soft)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hm-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icons.brain} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--hm-dark)' }}>Assistente terapêutico</div>
                    <div className="text-xs" style={{ color: 'var(--hm-text-muted)' }}>Disponível entre sessões</div>
                  </div>
                </div>
                {/* Floating badge 2 */}
                <div className="absolute -top-4 -right-4 hm-card shadow-lg px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--hm-lavender-light)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hm-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icons.lock} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--hm-dark)' }}>End-to-End</div>
                    <div className="text-xs" style={{ color: 'var(--hm-text-muted)' }}>Criptografado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "3", label: "Perfis integrados", sub: "Paciente · Psicóloga · Clínica" },
    { value: "24h", label: "Apoio entre sessões", sub: "Assistente configurado pela psicóloga" },
    { value: "AES‑256", label: "Criptografia", sub: "Dados sensíveis protegidos" },
    { value: "LGPD", label: "Conformidade", sub: "Resoluções CFP atendidas" },
  ]

  return (
    <section className="py-12" style={{ borderTop: '1px solid var(--hm-border)', borderBottom: '1px solid var(--hm-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="hm-stat-number">{s.value}</div>
              <div className="font-semibold text-sm mt-1" style={{ color: 'var(--hm-dark)' }}>{s.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--hm-text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Audience Tabs ────────────────────────────────────────────────────────────
function AudienceSection() {
  const [tab, setTab] = useState<"psicologa" | "clinica" | "paciente">("psicologa")

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as "psicologa" | "clinica" | "paciente"
      setTab(detail)
    }
    window.addEventListener("hm-tab-change", handler)
    return () => window.removeEventListener("hm-tab-change", handler)
  }, [])

  const content = {
    psicologa: {
      badge: "Para Psicólogas",
      badgeClass: "hm-badge",
      title: "Tudo que você precisa para atender com excelência",
      description: "Gerencie seus pacientes, prontuários, agenda e finanças em um só lugar. Com relatórios gerados por IA, você ganha mais tempo para o que realmente importa: o cuidado.",
      color: "var(--hm-rose)",
      features: [
        {
          icon: icons.chart, iconClass: "hm-icon-rose",
          title: "Painel de Métricas",
          desc: "Total de pacientes, consultas do dia, sessões pendentes e receita mensal em uma visão clara."
        },
        {
          icon: icons.clipboard, iconClass: "hm-icon-lavender",
          title: "Prontuário Digital",
          desc: "Anamnese, relatórios, declarações, laudos clínicos, avaliações e prescrições com anexo de PDF."
        },
        {
          icon: icons.brain, iconClass: "hm-icon-rose",
          title: "Relatórios por IA",
          desc: "O assistente — configurado com sua abordagem — acompanha o paciente entre as sessões e gera relatórios com temas, padrões emocionais e sugestões para você."
        },
        {
          icon: icons.dollar, iconClass: "hm-icon-sage",
          title: "Gestão Financeira",
          desc: "Controle de pagamentos por período — Pix, cartão, dinheiro e transferência — com status detalhado."
        },
        {
          icon: icons.calendar, iconClass: "hm-icon-lavender",
          title: "Agenda Recorrente",
          desc: "Configure sua disponibilidade semanal e deixe pacientes agendarem online com confirmação automática."
        },
        {
          icon: icons.message, iconClass: "hm-icon-rose",
          title: "Mensagens Criptografadas",
          desc: "Comunicação segura e privada com cada paciente, com histórico dentro do app."
        },
      ]
    },
    clinica: {
      badge: "Para Clínicas",
      badgeClass: "hm-badge-lavender",
      title: "Administre sua clínica com total controle",
      description: "Gerencie salas, psicólogas, pacientes e finanças com visibilidade completa. A divisão automática de valores simplifica a operação do dia a dia.",
      color: "var(--hm-lavender)",
      features: [
        {
          icon: icons.building, iconClass: "hm-icon-lavender",
          title: "Painel Administrativo",
          desc: "Visão geral de psicólogas, pacientes, consultas do dia e taxa de ocupação das salas."
        },
        {
          icon: icons.users, iconClass: "hm-icon-rose",
          title: "Gestão de Salas",
          desc: "Controle de capacidade, amenidades e disponibilidade. Aprovar solicitações de sala com um toque."
        },
        {
          icon: icons.dollar, iconClass: "hm-icon-sage",
          title: "Divisão Automática",
          desc: "Divisão de valores entre clínica e psicóloga por sessão, com controle de sublocações."
        },
        {
          icon: icons.trending, iconClass: "hm-icon-lavender",
          title: "Agenda Completa",
          desc: "Visualize todas as salas e profissionais em uma agenda integrada e unificada."
        },
        {
          icon: icons.bell, iconClass: "hm-icon-rose",
          title: "Convite e Gestão",
          desc: "Convide e gerencie psicólogas e pacientes afiliados com acompanhamento de status."
        },
        {
          icon: icons.chart, iconClass: "hm-icon-lavender",
          title: "Relatórios Financeiros",
          desc: "Controle financeiro de sublocações com status de pagamento e filtros por período."
        },
      ]
    },
    paciente: {
      badge: "Para Pacientes",
      badgeClass: "hm-badge-sage",
      title: "Cuide da sua saúde mental com acolhimento e praticidade",
      description: "Acesse apoio emocional a qualquer hora, agende consultas com facilidade e mantenha uma comunicação segura com sua psicóloga.",
      color: "var(--hm-sage)",
      features: [
        {
          icon: icons.brain, iconClass: "hm-icon-sage",
          title: "Assistente terapêutico",
          desc: "Um espaço de acolhimento disponível 24h, configurado pela sua psicóloga com a abordagem e o estilo dela — para estar com você entre as sessões."
        },
        {
          icon: icons.calendar, iconClass: "hm-icon-rose",
          title: "Agendamento Online",
          desc: "Consultas online ou presenciais, com visualização de horários disponíveis no calendário."
        },
        {
          icon: icons.message, iconClass: "hm-icon-lavender",
          title: "Mensagens Seguras",
          desc: "Comunicação criptografada diretamente com sua psicóloga dentro do app."
        },
        {
          icon: icons.file, iconClass: "hm-icon-sage",
          title: "Documentos Psicológicos",
          desc: "Solicite declarações, laudos e avaliações diretamente pelo app."
        },
        {
          icon: icons.dollar, iconClass: "hm-icon-rose",
          title: "Acompanhamento Financeiro",
          desc: "Histórico de sessões e pagamentos de forma organizada e transparente."
        },
        {
          icon: icons.phone, iconClass: "hm-icon-sage",
          title: "Acesso a Emergências",
          desc: "CVV (188), SAMU (192) e Polícia (190) acessíveis rapidamente quando mais precisar."
        },
      ]
    }
  }

  const active = content[tab]

  return (
    <section id="audience-section" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab nav */}
        <div className="flex justify-center mb-12">
          <div className="hm-tab-nav inline-flex">
            {(["psicologa", "clinica", "paciente"] as const).map((t) => {
              const labels = { psicologa: "Psicólogas", clinica: "Clínicas", paciente: "Pacientes" }
              return (
                <button
                  key={t}
                  className={`hm-tab-btn${tab === t ? " active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {labels[t]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="text-center mb-12">
            <span className={`${active.badgeClass} hm-badge mb-4 inline-flex`}>{active.badge}</span>
            <h2 className="hm-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--hm-dark)' }}>
              {active.title}
            </h2>
            <div className="hm-divider"></div>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--hm-text-muted)' }}>
              {active.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.features.map((f) => (
              <div key={f.title} className="hm-card p-6">
                <div className={`hm-icon-badge ${f.iconClass} mb-4`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--hm-dark)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── AI Feature ───────────────────────────────────────────────────────────────
function AISection() {
  return (
    <section className="py-20 hm-gradient-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="hm-badge mb-4 inline-flex">Assistente Terapêutico com IA</span>
          <h2 className="hm-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--hm-dark)' }}>
            Uma extensão da{" "}
            <span style={{ color: 'var(--hm-rose)' }}>sua terapia</span>
          </h2>
          <div className="hm-divider"></div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--hm-text-muted)' }}>
            O assistente <strong style={{ color: 'var(--hm-text)' }}>não faz terapia</strong> — ele é configurado pela psicóloga para ser uma presença acolhedora <strong style={{ color: 'var(--hm-text)' }}>entre as sessões</strong>, baseada na sua abordagem e no seu jeito de cuidar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="relative flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full hm-animate-pulse" style={{
                background: 'radial-gradient(circle, rgba(194,116,143,0.08) 0%, transparent 70%)',
                border: '2px dashed rgba(194,116,143,0.2)'
              }} />
              <div className="absolute inset-8 rounded-full" style={{
                background: 'radial-gradient(circle, rgba(155,142,196,0.1) 0%, transparent 70%)',
                border: '2px solid rgba(155,142,196,0.15)'
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl" style={{
                  background: 'linear-gradient(135deg, var(--hm-rose) 0%, var(--hm-lavender) 100%)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icons.brain} />
                  </svg>
                </div>
              </div>
              {[
                { icon: icons.mic,      bg: 'var(--hm-rose-soft)',      color: 'var(--hm-rose)',     pos: "top-4 right-8" },
                { icon: icons.chart,    bg: 'var(--hm-lavender-light)', color: 'var(--hm-lavender)', pos: "bottom-8 right-2" },
                { icon: icons.heart,    bg: 'var(--hm-sage-light)',     color: 'var(--hm-sage)',     pos: "bottom-8 left-2" },
                { icon: icons.clipboard,bg: 'var(--hm-rose-soft)',      color: 'var(--hm-rose)',     pos: "top-4 left-8" },
              ].map(({ icon, bg, color, pos }) => (
                <div key={pos} className={`absolute ${pos} w-10 h-10 rounded-full flex items-center justify-center shadow-md`} style={{ background: bg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6">
            {/* Como funciona */}
            <div className="hm-card p-6" style={{ background: 'var(--hm-white)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="hm-icon-badge hm-icon-rose">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icons.users} />
                  </svg>
                </div>
                <h3 className="font-bold" style={{ color: 'var(--hm-dark)' }}>Configurado pela psicóloga, no cadastro</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>
                Durante o cadastro, a psicóloga responde um questionário sobre sua abordagem terapêutica (Gestalt, TCC, Psicanálise…), seus públicos de especialização, seu estilo de comunicação e suas técnicas favoritas. Com isso, a IA é personalizada para falar e acolher como ela faria.
              </p>
            </div>

            {/* O que o assistente faz */}
            <div className="space-y-3">
              {[
                {
                  icon: icons.heart,
                  title: "Acolhimento entre sessões",
                  desc: "O paciente tem um espaço para registrar pensamentos, emoções e situações do cotidiano — com respostas no tom e na abordagem da sua psicóloga."
                },
                {
                  icon: icons.mic,
                  title: "Entrada por voz",
                  desc: "O paciente pode falar com o assistente de forma natural, sem precisar digitar."
                },
                {
                  icon: icons.trending,
                  title: "Relatórios para a psicóloga",
                  desc: "A IA identifica temas, padrões emocionais e comportamentais e gera relatórios estruturados para enriquecer as sessões presenciais."
                },
                {
                  icon: icons.clipboard,
                  title: "Sem diagnóstico, sem substituição",
                  desc: "O assistente não diagnostica, não prescreve e não substitui a terapia. Ele é um apoio ativo e registrador fiel do processo terapêutico."
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="hm-icon-badge hm-icon-rose flex-shrink-0 mt-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--hm-dark)' }}>{title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-12 rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--hm-rose-pale)', border: '1px solid var(--hm-rose-soft)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--hm-rose-soft)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--hm-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.shield} />
            </svg>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>
            <strong style={{ color: 'var(--hm-dark)' }}>Importante:</strong> O assistente é desenvolvido em conformidade com as resoluções do Conselho Federal de Psicologia e as diretrizes éticas para uso de IA na prática clínica. Ele nunca faz diagnósticos, não substitui a psicóloga e prioriza sempre a segurança do paciente — incluindo protocolos de emergência para situações de crise.
          </p>
        </div>

      </div>
    </section>
  )
}

// ─── Security ─────────────────────────────────────────────────────────────────
function SecuritySection() {
  return (
    <section id="seguranca" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="hm-badge-lavender hm-badge mb-4 inline-flex">Segurança & Privacidade</span>
          <h2 className="hm-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--hm-dark)' }}>
            Seus dados, <span style={{ color: 'var(--hm-lavender)' }}>protegidos com rigor</span>
          </h2>
          <div className="hm-divider"></div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--hm-text-muted)' }}>
            Projetado para atender às exigências da LGPD e às resoluções do Conselho Federal de Psicologia.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: icons.lock, iconClass: "hm-icon-lavender",
              title: "AES-256",
              desc: "Criptografia de nível militar para CPF, CRP, CNPJ, dados bancários e informações sensíveis."
            },
            {
              icon: icons.message, iconClass: "hm-icon-rose",
              title: "End-to-End",
              desc: "Mensagens diretas e prontuários com criptografia ponta a ponta. Somente você e seu paciente leem."
            },
            {
              icon: icons.shield, iconClass: "hm-icon-sage",
              title: "JWT + Refresh",
              desc: "Autenticação segura com tokens de renovação automática para proteger o acesso."
            },
            {
              icon: icons.users, iconClass: "hm-icon-lavender",
              title: "Controle de Acesso",
              desc: "Cada perfil (paciente, psicóloga, clínica) acessa somente o que lhe é pertinente."
            },
          ].map(({ icon, iconClass, title, desc }) => (
            <div key={title} className="hm-card p-6 text-center">
              <div className={`hm-icon-badge ${iconClass} mx-auto mb-4`} style={{ width: 56, height: 56 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--hm-dark)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CFP compliance banner */}
        <div className="mt-10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6" style={{ background: 'var(--hm-lavender-pale)', border: '1px solid var(--hm-lavender-light)' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--hm-lavender-light)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--hm-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.shield} />
            </svg>
          </div>
          <div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--hm-dark)' }}>Conformidade com o CFP</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>
              O Health Mind foi desenvolvido em conformidade com a Resolução CFP nº 11/2018 (atendimento online) e respeita integralmente a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Todos os dados de prontuários e comunicações seguem os critérios éticos do Conselho Federal de Psicologia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Resources (documentos CFP) ───────────────────────────────────────────────
function ResourcesSection() {
  return (
    <section id="recursos" className="py-20" style={{ background: 'var(--hm-rose-pale)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="hm-badge mb-4 inline-flex">Materiais do CFP</span>
          <h2 className="hm-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--hm-dark)' }}>
            Recursos para psicólogas
          </h2>
          <div className="hm-divider"></div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--hm-text-muted)' }}>
            Disponibilizamos as cartilhas do Conselho Federal de Psicologia sobre o uso ético de Inteligência Artificial na prática clínica.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {[
            {
              href: "/health-mind-app/documentos/Cartilha_IA_A5-1.pdf",
              icon: icons.brain,
              title: "Inteligência Artificial e Psicologia",
              desc: "Cartilha do CFP sobre o uso responsável e ético de IA na prática da psicologia.",
              badge: "CFP · PDF"
            },
            {
              href: "/health-mind-app/documentos/Cartilha_chatbot_IA_A5-1.pdf",
              icon: icons.message,
              title: "Chatbots e IA na Saúde Mental",
              desc: "Orientações do CFP sobre chatbots com IA no contexto da saúde mental e atendimento psicológico.",
              badge: "CFP · PDF"
            }
          ].map(({ href, icon, title, desc, badge }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hm-card p-6 flex gap-4 hover:no-underline group"
            >
              <div className="hm-icon-badge hm-icon-rose flex-shrink-0 mt-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--hm-dark)' }}>{title}</h3>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hm-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d={icons.download} />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--hm-text-muted)' }}>{desc}</p>
                <span className="hm-badge text-xs">{badge}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── General Features ─────────────────────────────────────────────────────────
function GeneralFeaturesSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="hm-heading text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--hm-dark)' }}>
            Recursos para todo o ecossistema
          </h2>
          <div className="hm-divider"></div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--hm-text-muted)' }}>
            Funcionalidades pensadas para melhorar a experiência de todos os usuários do Health Mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: icons.bell, iconClass: "hm-icon-rose", title: "Notificações Push", desc: "Lembretes de consulta, novas mensagens, solicitações e atualizações de pagamento." },
            { icon: icons.sun, iconClass: "hm-icon-lavender", title: "Tema Claro e Escuro", desc: "Escolha o tema que mais conforta sua visão, a qualquer momento." },
            { icon: icons.phone, iconClass: "hm-icon-sage", title: "Central de Ajuda", desc: "Perguntas frequentes e sistema de tickets de suporte integrado ao app." },
            { icon: icons.file, iconClass: "hm-icon-rose", title: "Termos e Privacidade", desc: "Termos de Uso e Política de Privacidade sempre acessíveis dentro do aplicativo." },
          ].map(({ icon, iconClass, title, desc }) => (
            <div key={title} className="hm-card p-6">
              <div className={`hm-icon-badge ${iconClass} mb-4`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--hm-dark)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--hm-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section id="contato" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 md:p-16 text-center" style={{
          background: 'linear-gradient(135deg, var(--hm-rose) 0%, var(--hm-lavender) 100%)'
        }}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons.heart} />
            </svg>
          </div>
          <h2 className="hm-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Pronta para transformar sua prática?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Junte-se às psicólogas e clínicas que já utilizam o Health Mind para oferecer um cuidado mais eficiente, seguro e humano.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:contato@losningtech.com.br?subject=Interesse no Health Mind"
              className="inline-flex items-center gap-2 bg-white font-semibold rounded-full px-8 py-4 text-base transition-opacity hover:opacity-90"
              style={{ color: 'var(--hm-rose)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icons.message} />
              </svg>
              Solicitar Demonstração
            </a>
            <a
              href="https://wa.me/5561983730910?text=Olá! Tenho interesse no Health Mind"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/30 font-semibold rounded-full px-8 py-4 text-base transition-all hover:bg-white/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icons.phone} />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10" style={{ borderTop: '1px solid var(--hm-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Health Mind brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/health-mind-app/images/logo.png"
              alt="Health Mind"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <div className="hm-heading font-bold text-sm" style={{ color: 'var(--hm-dark)' }}>Health Mind</div>
              <div className="text-xs" style={{ color: 'var(--hm-text-muted)' }}>Plataforma de Saúde Mental</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--hm-text-muted)' }}>
            <Link href="/health-mind-app/privacy" className="hover:text-rose-500 transition-colors" style={{ color: 'var(--hm-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--hm-rose)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--hm-text-muted)')}>
              Política de Privacidade
            </Link>
            <a href="#recursos" className="hover:text-rose-500 transition-colors"
              style={{ color: 'var(--hm-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--hm-rose)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--hm-text-muted)')}>
              Cartilhas CFP
            </a>
            <a href="mailto:contato@losningtech.com.br" className="transition-colors"
              style={{ color: 'var(--hm-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--hm-rose)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--hm-text-muted)')}>
              contato@losningtech.com.br
            </a>
          </div>

          {/* Losning Tech signature */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--hm-text-muted)' }}>Produto licenciado por</span>
            <a href="/" className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png"
                alt="Losning Tech"
                width={80}
                height={24}
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--hm-border)', color: 'var(--hm-text-muted)' }}>
          © {new Date().getFullYear()} Health Mind · Todos os direitos reservados · Desenvolvido e licenciado por{" "}
          <a href="/" className="font-medium" style={{ color: 'var(--hm-rose)' }}>Losning Tech</a>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HealthMindPage() {
  return (
    <div className="hm-body">
      <NavBar />
      <Hero />
      <Stats />
      <AudienceSection />
      <AISection />
      <SecuritySection />
      <GeneralFeaturesSection />
      <ResourcesSection />
      <CTASection />
      <Footer />
    </div>
  )
}
