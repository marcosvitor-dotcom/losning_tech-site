"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// ─── Planos (mesmos da rota de backend) ───────────────────────────────────────
const PLANS: Record<string, {
  name: string; price: number; setupFee: number; description: string
  type: "psychologist" | "clinic"; patients: number; psychologists?: number
  features: string[]
}> = {
  psico_consciencia: {
    name: "Consciência", price: 300, setupFee: 0, type: "psychologist", patients: 5,
    description: "Plano ideal para psicólogos iniciando na plataforma.",
    features: ["Até 5 pacientes ativos", "Agenda e prontuário", "Relatórios IA", "Chat seguro", "Documentos psicológicos"],
  },
  psico_equilibrio: {
    name: "Equilíbrio", price: 500, setupFee: 150, type: "psychologist", patients: 10,
    description: "Para psicólogos com demanda crescente de pacientes.",
    features: ["Até 10 pacientes ativos", "Agenda e prontuário", "Relatórios IA", "Chat seguro", "Videoconferência", "Suporte prioritário"],
  },
  psico_plenitude: {
    name: "Plenitude", price: 700, setupFee: 150, type: "psychologist", patients: 15,
    description: "Para psicólogos com alta demanda e necessidade completa.",
    features: ["Até 15 pacientes ativos", "Agenda e prontuário", "Relatórios IA", "Chat seguro", "Videoconferência", "Anamnese digital", "Suporte prioritário"],
  },
  clinic_essencia: {
    name: "Essência", price: 800, setupFee: 350, type: "clinic", patients: 15, psychologists: 3,
    description: "Para clínicas de psicologia com equipe pequena.",
    features: ["Até 3 psicólogos(as)", "Até 15 pacientes", "Gestão de salas", "Financeiro", "Agenda unificada"],
  },
  clinic_amplitude: {
    name: "Amplitude", price: 1200, setupFee: 350, type: "clinic", patients: 25, psychologists: 5,
    description: "Para clínicas em expansão com mais psicólogos.",
    features: ["Até 5 psicólogos(as)", "Até 25 pacientes", "Gestão de salas", "Financeiro avançado", "Relatórios por psicólogo", "Suporte prioritário"],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function InputField({
  label, type = "text", value, onChange, placeholder, error, hint, required, disabled,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; error?: string; hint?: string; required?: boolean; disabled?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#3D3347", marginBottom: 5, letterSpacing: 0.3 }}>
        {label} {required && <span style={{ color: "#C2748F" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: `1.5px solid ${error ? "#E53935" : "#EDE8F2"}`,
          fontSize: 14, color: "#2D2435", background: disabled ? "#F5F5F5" : "#FAFAFA",
          outline: "none", boxSizing: "border-box", cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = "#C2748F" }}
        onBlur={e => { if (!error) e.target.style.borderColor = "#EDE8F2" }}
      />
      {error && <p style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}>{error}</p>}
      {hint && !error && <p style={{ color: "#8C7F99", fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const planKey = params?.plan as string

  const plan = PLANS[planKey]

  // form state
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [cnpj, setCnpj]         = useState("")
  const [crp, setCrp]           = useState("")
  const [phone, setPhone]       = useState("")

  // errors
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(false)
  const [globalError, setGlobalError] = useState("")

  useEffect(() => {
    if (!plan) router.replace("/health-mind-app#planos")
  }, [plan, router])

  if (!plan) return null

  const isClinic = plan.type === "clinic"
  const total = plan.setupFee + plan.price

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())  e.name  = "Nome é obrigatório"
    if (!email.trim()) e.email = "E-mail é obrigatório"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido"
    if (isClinic && !cnpj.trim()) e.cnpj = "CNPJ é obrigatório para clínicas"
    if (!isClinic && !crp.trim()) e.crp  = "CRP é obrigatório para psicólogos(as)"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError("")
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch("/api/hm-checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, name: name.trim(), email: email.trim(), cnpj: cnpj || null, crp: crp || null, phone: phone || null }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erro ao criar preferência de pagamento")
      }

      // Redireciona para o checkout do Mercado Pago
      const url = process.env.NODE_ENV === "production" ? data.initPoint : (data.sandboxInitPoint || data.initPoint)
      window.location.href = url
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao processar. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F0F8", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "#1A252F", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/health-mind-app#planos" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={28} height={28} style={{ borderRadius: 7 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Health Mind</span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Finalizar assinatura</span>
      </header>

      <div style={{ flex: 1, maxWidth: 960, margin: "0 auto", width: "100%", padding: "40px 16px 60px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

        {/* Formulário */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#2D2435", marginBottom: 6 }}>
            Criar sua conta
          </h1>
          <p style={{ color: "#8C7F99", fontSize: 14, marginBottom: 28 }}>
            Preencha os dados abaixo. Sua conta será criada automaticamente após a confirmação do pagamento.
          </p>

          {globalError && (
            <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 20 }}>
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#2D2435", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #EDE8F2" }}>
                Dados de acesso
              </h2>
              <InputField label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" error={errors.name} required />
              <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" error={errors.email} required />
              <p style={{ fontSize: 12, color: "#8C7F99", marginTop: -8, marginBottom: 8 }}>
                Após a confirmação do pagamento, você receberá um e-mail para definir sua senha de acesso.
              </p>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#2D2435", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #EDE8F2" }}>
                Dados profissionais
              </h2>
              {isClinic
                ? <InputField label="CNPJ" value={cnpj} onChange={setCnpj} placeholder="00.000.000/0001-00" error={errors.cnpj} required />
                : <InputField label="Número do CRP" value={crp} onChange={setCrp} placeholder="Ex: 01/12345" error={errors.crp} required />
              }
              <InputField label="Telefone (opcional)" type="tel" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" />
            </div>

            {/* Termos */}
            <p style={{ fontSize: 12, color: "#8C7F99", marginBottom: 20, lineHeight: 1.6 }}>
              Ao continuar, você concorda com nossa{" "}
              <Link href="/health-mind-app/privacy" style={{ color: "#C2748F" }}>Política de Privacidade</Link>
              {" "}e os termos de uso da plataforma.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: loading ? "#9B8EC4" : "linear-gradient(135deg, #C2748F 0%, #9B8EC4 100%)",
                color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: loading ? "none" : "0 4px 20px rgba(194,116,143,0.4)",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "hm-spin 0.7s linear infinite", display: "inline-block" }} />
                  Redirecionando para o pagamento...
                </>
              ) : (
                <>
                  Continuar para pagamento
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resumo do plano */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #EDE8F2" }}>
              <Image src="/health-mind-app/images/favicon.png" alt="" width={32} height={32} style={{ borderRadius: 8 }} />
              <div>
                <div style={{ fontSize: 12, color: "#8C7F99", fontWeight: 600 }}>Plano selecionado</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#2D2435" }}>Health Mind {plan.name}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#8C7F99", marginBottom: 12 }}>{plan.description}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3D3347" }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#E8F7F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cobrança */}
            <div style={{ background: "#F4F0F8", borderRadius: 12, padding: "14px 16px" }}>
              {plan.setupFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8C7F99", marginBottom: 6 }}>
                  <span>Taxa de adesão (única vez)</span>
                  <span>{fmtMoney(plan.setupFee)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8C7F99", marginBottom: 10 }}>
                <span>1ª mensalidade</span>
                <span>{fmtMoney(plan.price)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#2D2435", paddingTop: 10, borderTop: "1px solid #EDE8F2" }}>
                <span>Total hoje</span>
                <span>{fmtMoney(total)}</span>
              </div>
              <p style={{ fontSize: 11, color: "#8C7F99", marginTop: 6 }}>
                {plan.setupFee > 0 ? `Após o 1º mês: ${fmtMoney(plan.price)}/mês` : `Renovação mensal: ${fmtMoney(plan.price)}/mês`}
              </p>
            </div>
          </div>

          {/* Segurança */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Pagamento seguro via Mercado Pago" },
              { icon: "M20 6L9 17l-5-5", text: "Conta criada automaticamente após pagamento" },
              { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6", text: "E-mail enviado para definir sua senha" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#8C7F99" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hm-spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
