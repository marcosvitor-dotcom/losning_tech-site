"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  getUser,
  getToken,
  isAuthenticated,
  apiGetMyTickets,
  apiCreateTicket,
  SupportTicket,
  HMUser,
} from "../lib/auth"

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ: { question: string; answer: string; roles: string[] }[] = [
  {
    question: "Como agendar uma consulta?",
    answer: "Acesse a aba \"Agendar\" no menu do app, selecione o psicólogo, data e horário disponível e confirme o agendamento.",
    roles: ["patient", "client"],
  },
  {
    question: "Como cancelar uma consulta?",
    answer: "Vá até a aba \"Agenda\" no app, toque na consulta que deseja cancelar e selecione \"Cancelar consulta\".",
    roles: ["patient", "client"],
  },
  {
    question: "Estou em crise, o que fazer?",
    answer: "Em emergência, ligue para o CVV no 188 (disponível 24h) ou acesse cvv.org.br. Em perigo imediato, ligue 192 (SAMU).",
    roles: ["patient", "client"],
  },
  {
    question: "Como agendar uma consulta para meu paciente?",
    answer: "Acesse \"Agenda\", toque em \"Nova consulta\", selecione o paciente, data, horário e tipo de consulta.",
    roles: ["psychologist"],
  },
  {
    question: "Como configurar consultas recorrentes?",
    answer: "Ao criar um agendamento, ative a opção \"Replicar\" e defina a quantidade de semanas.",
    roles: ["psychologist"],
  },
  {
    question: "Como funciona o financeiro?",
    answer: "Na aba \"Financeiro\" você visualiza pagamentos, valores a receber e confirmados. Registre pagamentos e acompanhe o fluxo financeiro.",
    roles: ["psychologist"],
  },
  {
    question: "Como convidar um psicólogo para a clínica?",
    answer: "Acesse a aba \"Psicólogos\", toque em \"Convidar\" e insira o e-mail do profissional.",
    roles: ["clinic"],
  },
  {
    question: "Como gerenciar as salas?",
    answer: "Na aba \"Salas\" cadastre novas salas, defina valores de sublocação, horários e visualize a agenda de cada sala.",
    roles: ["clinic"],
  },
  {
    question: "Como funciona a sublocação de salas?",
    answer: "Quando um psicólogo agenda uma consulta presencial em uma de suas salas, o valor de sublocação é automaticamente registrado.",
    roles: ["clinic"],
  },
  {
    question: "Como baixar o aplicativo?",
    answer: "O Health Mind está disponível na App Store (iOS) e Google Play (Android). Busque por \"Health Mind\" nas lojas.",
    roles: ["patient", "client", "psychologist", "clinic"],
  },
  {
    question: "Como redefinir minha senha?",
    answer: "Na tela de login do aplicativo, toque em \"Esqueceu a senha?\" e siga as instruções enviadas para o seu e-mail.",
    roles: ["patient", "client", "psychologist", "clinic"],
  },
]

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
  closed: "Fechado",
}
const STATUS_COLOR: Record<string, string> = {
  open: "#F5A623",
  in_progress: "#4A90E2",
  resolved: "#50C878",
  closed: "#9B9B9B",
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
type Tab = "faq" | "contato" | "ticket" | "historico"

export default function SuportePage() {
  const [user, setUser] = useState<HMUser | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("faq")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Ticket form
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState("")

  // Tickets history
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    setLoggedIn(isAuthenticated())
  }, [])

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const data = await apiGetMyTickets()
      setTickets(data)
    } catch {
      /* silent */
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "historico" && loggedIn) loadTickets()
  }, [activeTab, loggedIn, loadTickets])

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendError("")
    if (!subject.trim()) { setSendError("Informe o assunto."); return }
    if (!message.trim()) { setSendError("Escreva sua mensagem."); return }
    setSending(true)
    try {
      await apiCreateTicket(subject.trim(), message.trim())
      setSendSuccess(true)
      setSubject("")
      setMessage("")
    } catch (err: any) {
      setSendError(err.message || "Não foi possível enviar a mensagem.")
    } finally {
      setSending(false)
    }
  }

  const role = user?.role || "patient"
  const filteredFaq = FAQ.filter(f => f.roles.includes(role))

  const tabs: { key: Tab; label: string; icon: string; requiresAuth?: boolean }[] = [
    { key: "faq", label: "FAQ", icon: "?" },
    { key: "contato", label: "Contato", icon: "📞" },
    { key: "ticket", label: "Enviar Mensagem", icon: "✉️", requiresAuth: true },
    { key: "historico", label: "Meus Chamados", icon: "📋", requiresAuth: true },
  ]

  return (
    <div className="hm-body" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        background: "#1A252F",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/health-mind-app" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={32} height={32} style={{ borderRadius: 8 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Health Mind</span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {loggedIn ? (
            <Link href={user?.role === "clinic" ? "/health-mind-app/dashboard/clinica" : "/health-mind-app/dashboard/psicologo"}
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textDecoration: "none" }}>
              ← Painel
            </Link>
          ) : (
            <Link href="/health-mind-app/login"
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textDecoration: "none" }}>
              Entrar
            </Link>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 16px 60px" }}>
        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 className="hm-heading" style={{ fontSize: 30, fontWeight: 800, color: "var(--hm-dark)", margin: "0 0 8px" }}>
            Central de Ajuda
          </h1>
          <p style={{ color: "var(--hm-text-muted)", fontSize: 15 }}>
            Como podemos ajudar você?
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {tabs.map(tab => {
            const disabled = tab.requiresAuth && !loggedIn
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => { if (!disabled) setActiveTab(tab.key) }}
                title={disabled ? "Faça login para acessar" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 20, border: "1.5px solid",
                  borderColor: active ? "var(--hm-rose)" : "var(--hm-border)",
                  background: active ? "var(--hm-rose)" : "#fff",
                  color: active ? "#fff" : disabled ? "#ccc" : "var(--hm-text-muted)",
                  fontSize: 13, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {disabled && <span style={{ fontSize: 10 }}>🔒</span>}
              </button>
            )
          })}
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        {activeTab === "faq" && (
          <div>
            <p style={{ color: "var(--hm-text-muted)", fontSize: 14, marginBottom: 16 }}>
              Perguntas frequentes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredFaq.map((item, i) => (
                <div
                  key={i}
                  className="hm-card"
                  style={{
                    cursor: "pointer",
                    borderColor: expandedFaq === i ? "var(--hm-rose)" : "var(--hm-border)",
                  }}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                    <span style={{ color: "var(--hm-rose)", fontSize: 18, flexShrink: 0 }}>?</span>
                    <span style={{ flex: 1, fontWeight: 500, color: "var(--hm-text)", fontSize: 14 }}>
                      {item.question}
                    </span>
                    <span style={{ color: "var(--hm-text-muted)", fontSize: 16, transition: "transform 0.2s", transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                      ▾
                    </span>
                  </div>
                  {expandedFaq === i && (
                    <div style={{ padding: "0 16px 14px 44px", color: "var(--hm-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contato ──────────────────────────────────────────────────── */}
        {activeTab === "contato" && (
          <div>
            <p style={{ color: "var(--hm-text-muted)", fontSize: 14, marginBottom: 20 }}>
              Entre em contato por um dos canais abaixo
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Email */}
              <a
                href="mailto:admin@losningtech.com?subject=Suporte Health Mind"
                className="hm-card"
                style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, textDecoration: "none" }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 26,
                  background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--hm-dark)", fontSize: 15 }}>E-mail</div>
                  <div style={{ color: "#4A90E2", fontSize: 14, fontWeight: 500 }}>admin@losningtech.com</div>
                  <div style={{ color: "var(--hm-text-muted)", fontSize: 12 }}>Toque para enviar e-mail</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hm-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5561983730910?text=Olá, preciso de ajuda com o Health Mind App."
                target="_blank"
                rel="noopener noreferrer"
                className="hm-card"
                style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, textDecoration: "none" }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 26,
                  background: "#E7F9EE", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--hm-dark)", fontSize: 15 }}>WhatsApp</div>
                  <div style={{ color: "#25D366", fontSize: 14, fontWeight: 500 }}>+55 (61) 98373-0910</div>
                  <div style={{ color: "var(--hm-text-muted)", fontSize: 12 }}>Toque para abrir WhatsApp</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--hm-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>

            {!loggedIn && (
              <div style={{
                marginTop: 20, background: "var(--hm-rose-pale)", border: "1px solid var(--hm-rose-soft)",
                borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div style={{ fontSize: 13, color: "var(--hm-text)" }}>
                  Psicólogos e clínicas podem abrir chamados formais.{" "}
                  <Link href="/health-mind-app/login" style={{ color: "var(--hm-rose)", fontWeight: 600 }}>
                    Faça login
                  </Link>
                  {" "}para acessar.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Enviar Ticket ─────────────────────────────────────────────── */}
        {activeTab === "ticket" && (
          <div>
            <p style={{ color: "var(--hm-text-muted)", fontSize: 14, marginBottom: 20 }}>
              Envie uma mensagem para nossa equipe de suporte
            </p>

            {sendSuccess ? (
              <div style={{
                background: "#E8FFF0", border: "1px solid #A8D4CB", borderRadius: 14,
                padding: "28px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, color: "#2D2435", fontSize: 17, marginBottom: 6 }}>Mensagem enviada!</div>
                <div style={{ color: "#8C7F99", fontSize: 14 }}>
                  Nossa equipe responderá em breve. Acompanhe em "Meus Chamados".
                </div>
                <button
                  onClick={() => { setSendSuccess(false); setActiveTab("historico") }}
                  style={{
                    marginTop: 20, background: "var(--hm-rose)",
                    color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Ver Meus Chamados
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} noValidate>
                <div className="hm-card" style={{ padding: 24 }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--hm-text)", marginBottom: 6 }}>
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Ex: Problema com agendamento"
                      maxLength={200}
                      disabled={sending}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 10,
                        border: "1.5px solid var(--hm-border)", fontSize: 14,
                        color: "var(--hm-text)", background: "var(--hm-off-white)",
                        boxSizing: "border-box", outline: "none",
                      }}
                      onFocus={e => e.target.style.borderColor = "var(--hm-rose)"}
                      onBlur={e => e.target.style.borderColor = "var(--hm-border)"}
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--hm-text)", marginBottom: 6 }}>
                      Mensagem
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Descreva seu problema ou dúvida com detalhes..."
                      maxLength={2000}
                      rows={6}
                      disabled={sending}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 10,
                        border: "1.5px solid var(--hm-border)", fontSize: 14,
                        color: "var(--hm-text)", background: "var(--hm-off-white)",
                        boxSizing: "border-box", outline: "none", resize: "vertical",
                        fontFamily: "inherit",
                      }}
                      onFocus={e => e.target.style.borderColor = "var(--hm-rose)"}
                      onBlur={e => e.target.style.borderColor = "var(--hm-border)"}
                    />
                    <div style={{ textAlign: "right", fontSize: 11, color: "var(--hm-text-muted)", marginTop: 4 }}>
                      {message.length}/2000
                    </div>
                  </div>

                  {sendError && (
                    <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 8, padding: "10px 14px", color: "#C62828", fontSize: 13, marginBottom: 14 }}>
                      {sendError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      width: "100%", padding: "13px", borderRadius: 10, border: "none",
                      background: sending ? "#ccc" : "linear-gradient(135deg, var(--hm-rose) 0%, var(--hm-lavender) 100%)",
                      color: "#fff", fontSize: 15, fontWeight: 600,
                      cursor: sending ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {sending ? (
                      <>
                        <span style={{
                          width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                          borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
                          animation: "hm-spin 0.7s linear infinite",
                        }} />
                        Enviando...
                      </>
                    ) : "Enviar Mensagem"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Histórico de tickets ──────────────────────────────────────── */}
        {activeTab === "historico" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ color: "var(--hm-text-muted)", fontSize: 14, margin: 0 }}>
                Acompanhe o status das suas mensagens
              </p>
              <button
                onClick={loadTickets}
                disabled={loadingTickets}
                style={{
                  background: "none", border: "1px solid var(--hm-border)",
                  borderRadius: 8, padding: "6px 12px", fontSize: 12,
                  color: "var(--hm-text-muted)", cursor: "pointer",
                }}
              >
                {loadingTickets ? "Carregando..." : "↻ Atualizar"}
              </button>
            </div>

            {loadingTickets ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: 70, background: "#F5F5F5", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--hm-text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div style={{ fontSize: 15 }}>Você ainda não enviou nenhuma mensagem</div>
                <button
                  onClick={() => setActiveTab("ticket")}
                  style={{
                    marginTop: 16, background: "var(--hm-rose)", color: "#fff",
                    border: "none", borderRadius: 10, padding: "10px 24px",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Enviar agora
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tickets.map(ticket => (
                  <div
                    key={ticket._id}
                    className="hm-card"
                    style={{
                      cursor: "pointer",
                      borderColor: expandedTicket === ticket._id ? "var(--hm-rose)" : "var(--hm-border)",
                    }}
                    onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "var(--hm-dark)", fontSize: 14 }}>
                          {ticket.subject}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--hm-text-muted)", marginTop: 2 }}>
                          {formatDate(ticket.createdAt)}
                        </div>
                      </div>
                      <span style={{
                        background: STATUS_COLOR[ticket.status] + "22",
                        color: STATUS_COLOR[ticket.status],
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                      }}>
                        {STATUS_LABEL[ticket.status]}
                      </span>
                      <span style={{ color: "var(--hm-text-muted)", fontSize: 14, transition: "transform 0.2s", transform: expandedTicket === ticket._id ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                    </div>

                    {expandedTicket === ticket._id && (
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--hm-border)" }}>
                        <div style={{ paddingTop: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--hm-text-muted)", marginBottom: 4 }}>Sua mensagem:</div>
                          <div style={{ fontSize: 14, color: "var(--hm-text)", lineHeight: 1.6 }}>{ticket.message}</div>
                        </div>

                        {ticket.responses && ticket.responses.length > 0 && (
                          <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--hm-text-muted)", marginBottom: 8 }}>Respostas:</div>
                            {ticket.responses.map((r, i) => (
                              <div key={i} style={{
                                background: "var(--hm-rose-pale)", borderRadius: 10, padding: 12, marginBottom: 8,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--hm-rose)" }}>🛡 Suporte</span>
                                  <span style={{ fontSize: 11, color: "var(--hm-text-muted)", marginLeft: "auto" }}>
                                    {formatDate(r.createdAt)}
                                  </span>
                                </div>
                                <div style={{ fontSize: 14, color: "var(--hm-text)", lineHeight: 1.6 }}>{r.message}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer simples */}
      <footer style={{ borderTop: "1px solid var(--hm-border)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, fontSize: 13, color: "var(--hm-text-muted)" }}>
          <Link href="/health-mind-app" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Home</Link>
          <Link href="/health-mind-app/privacy" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Privacidade</Link>
          <Link href="/health-mind-app/copyright" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Direitos Autorais</Link>
          <Link href="/health-mind-app/login" style={{ color: "var(--hm-text-muted)", textDecoration: "none" }}>Área de Acesso</Link>
        </div>
      </footer>

      <style>{`
        @keyframes hm-spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
