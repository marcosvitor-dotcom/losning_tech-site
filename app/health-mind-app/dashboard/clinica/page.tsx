"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getUser, getToken, clearSession, HMUser } from "../../lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "psychologists" | "patients" | "schedule" | "financial" | "rooms" | "profile"

interface ClinicData {
  _id: string; name: string; email: string; phone?: string; cnpj?: string
  logo?: string; address?: { street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; zipCode?: string }
}
interface ClinicStats {
  totalPsychologists?: number; totalPatients?: number; appointmentsToday?: number; occupancyRate?: number; newPatientsThisMonth?: number
}
interface ClinicPsychologist {
  _id: string; name: string; email?: string; crp?: string; phone?: string; avatar?: string; specialties?: string[]; patientCount?: number
}
interface Patient {
  _id: string; name: string; email?: string; phone?: string; avatar?: string; status?: string; psychologistId?: string | { _id: string; name: string }
}
interface Appointment {
  _id: string; dateTime?: string; date?: string; duration?: number; status: string; type?: string; notes?: string
  psychologist?: { name: string }; psychologistId?: string | { _id: string; name: string }
  patient?: { name: string }; patientId?: string | { _id: string; name: string }
}
interface PaymentData {
  _id: string; sessionValue?: number; clinicAmount?: number; psychologistAmount?: number; finalValue?: number
  status: string; paymentMethod?: string; dueDate?: string; paidAt?: string; confirmedAt?: string
  patientId?: string | { _id: string; name: string }; psychologistId?: string | { _id: string; name: string }
  clinicPercentage?: number
}
interface ClinicFinancialSummary {
  totalSessions?: number; confirmedPayments?: { count: number; value: number }; pendingPayments?: { count: number; value: number }
  awaitingConfirmation?: { count: number; value: number }; cancelledPayments?: { count: number; value: number }
  clinicRevenue?: number
  byPsychologist?: { name: string; totalSessions: number; confirmed: number; pending: number }[]
}
interface SubleaseSummary { totalCost?: number; paidCost?: number; pendingCost?: number; items?: any[] }
interface Room {
  _id: string; name: string; number?: string; capacity?: number; isActive: boolean; amenities?: string[]; subleasePrice?: number
}
interface RoomRequest {
  _id: string; date?: string; dateTime?: string; duration?: number; status?: string
  psychologistId?: string | { _id: string; name: string }
  patientId?: string | { _id: string; name: string }
  roomId?: string | { _id: string; name: string }
}
interface Sublease {
  _id: string; value?: number; status: string; appointmentDate?: string
  psychologistId?: string | { _id: string; name: string }
  patientId?: string | { _id: string; name: string }
  roomId?: string | { _id: string; name: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = "/api/hm"
const hdrs = (token: string) => ({ Authorization: `Bearer ${token}` })
const jsonHdrs = (token: string) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" })

function getName(v?: string | { _id: string; name: string }) {
  if (!v) return "—"; if (typeof v === "string") return v; return v.name
}
function getId(v?: string | { _id: string; name: string }) {
  if (!v) return ""; if (typeof v === "string") return v; return v._id
}
function getAptDate(a: Appointment) { return a.dateTime || a.date || "" }
function fmtTime(dt: string) { if (!dt) return "--:--"; return new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
function fmtDate(dt: string) { if (!dt) return "--"; return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) }
function fmtDateShort(dt: string) { if (!dt) return "--"; return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) }
function fmtMoney(v?: number) { if (v == null) return "R$ --"; return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }
function fmtPct(v?: number) { if (v == null) return "--"; return `${Math.round(v)}%` }
function fmtMonthYear(d: Date) { return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) }

const S_LABEL: Record<string, string> = {
  confirmed: "Confirmado", scheduled: "Agendado", completed: "Realizado", cancelled: "Cancelado",
  pending: "Pendente", awaiting_patient: "Aguard. paciente", awaiting_psychologist: "Aguard. psicólogo",
}
const S_COLOR: Record<string, string> = {
  confirmed: "#2A9D8F", scheduled: "#4A90E2", completed: "#6B8088", cancelled: "#E53935",
  pending: "#FF9800", awaiting_patient: "#FF9800", awaiting_psychologist: "#FF9800",
}
const PAY_LABEL: Record<string, string> = { pending: "Pendente", awaiting_confirmation: "Aguard. confirmação", confirmed: "Confirmado", cancelled: "Cancelado" }
const PAY_COLOR: Record<string, string> = { pending: "#FF9800", awaiting_confirmation: "#9B8EC4", confirmed: "#2A9D8F", cancelled: "#E53935" }

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F2F5F7", sidebar: "#1B3A4B", sidebarActive: "rgba(42,157,143,0.2)", sidebarBorder: "#2A9D8F",
  card: "#fff", teal: "#2A9D8F", tealLight: "#E8F7F6", dark: "#1B3A4B", muted: "#6B8088",
  border: "#E8EDEF", rose: "#C2748F", amber: "#FF9800",
}

// ─── Components ───────────────────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor", sw = 2 }: { d: string | string[]; size?: number; color?: string; sw?: number }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}
function Sk({ w = "100%", h = 14, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "#E8EDEF", animation: "cl-pulse 1.4s ease-in-out infinite" }} />
}
function Av({ name, src, size = 36 }: { name: string; src?: string; size?: number }) {
  const ini = name.split(" ").slice(0, 2).map(n => n[0] || "").join("").toUpperCase()
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#2A9D8F,#9B8EC4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>{ini}</div>
}
function Bdg({ label, color }: { label: string; color: string }) {
  return <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", ...style }}>{children}</div>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: "0 0 20px" }}>{children}</h2>
}
function RefreshBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: C.tealLight, border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.teal, fontSize: 13, fontWeight: 600 }}>
      <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" size={14} color={C.teal} /> Atualizar
    </button>
  )
}
function ErrBox({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>{msg}{onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontWeight: 600, fontSize: 13, marginLeft: 8 }}>Tentar novamente</button>}</div>
}

const ICO = {
  overview:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  psychs:    ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  patients:  ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  schedule:  ["M8 2v4M16 2v4M3 10h18","M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  financial: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  rooms:     ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  profile:   ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  logout:    ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  search:    ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.35-4.35"],
  clock:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  check:     "M20 6L9 17l-5-5",
  x:         "M18 6L6 18M6 6l12 12",
  chevL:     "M15 18l-6-6 6-6",
  chevR:     "M9 18l6-6-6-6",
  phone:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6z",
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  building:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  plus:      ["M12 5v14","M5 12h14"],
  door:      ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  filter:    ["M22 3H2l8 9.46V19l4 2v-8.54L22 3"],
  unlink:    ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  menu:      ["M3 12h18","M3 6h18","M3 18h18"],
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [stats, setStats] = useState<ClinicStats | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const h = hdrs(token)
      const now = new Date()
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const [clinicRes, statsRes] = await Promise.all([
        fetch(`${BASE}/clinics/${clinicId}`, { headers: h }),
        fetch(`${BASE}/clinics/${clinicId}/stats`, { headers: h }),
      ])
      const [clinicData, statsData] = await Promise.all([clinicRes.json(), statsRes.json()])
      setClinic(clinicData?.data ?? clinicData ?? null)
      const s = statsData?.data ?? statsData ?? {}
      // tenta buscar novos pacientes do mês
      let newPatients = s.newPatientsThisMonth
      if (newPatients == null) {
        try {
          const mRes = await fetch(`${BASE}/clinics/${clinicId}/stats/monthly`, { headers: h })
          const mData = await mRes.json()
          newPatients = mData?.data?.newPatientsThisMonth ?? mData?.newPatientsThisMonth ?? 0
        } catch { newPatients = 0 }
      }
      setStats({ ...s, newPatientsThisMonth: newPatients })
    } catch (e: any) { setError(e.message || "Erro ao carregar dados") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load() }, [load])

  const statCards = [
    { label: "Psicólogos",     value: stats?.totalPsychologists ?? "—", icon: ICO.psychs,   color: "#2A9D8F", bg: "#E8F7F6" },
    { label: "Consultas Hoje", value: stats?.appointmentsToday  ?? "—", icon: ICO.schedule,  color: "#FF9800", bg: "#FFF4E6" },
    { label: "Pacientes",      value: stats?.totalPatients      ?? "—", icon: ICO.patients,  color: "#9B8EC4", bg: "#F2F0FA" },
    { label: "Ocupação",       value: stats?.occupancyRate != null ? fmtPct(stats.occupancyRate) : "—", icon: ICO.financial, color: "#4A90E2", bg: "#EEF4FF" },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: 0 }}>
          {loading ? "Carregando..." : `Olá, ${clinic?.name?.split(" ")[0] ?? "Clínica"}! 👋`}
        </h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Resumo da sua clínica</p>
      </div>
      {error && <ErrBox msg={error} onRetry={load} />}

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {statCards.map(s => (
          <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 16px" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={s.icon} color={s.color} size={20} />
            </div>
            <div>
              {loading ? <Sk w={60} h={22} /> : <div style={{ fontSize: 24, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{s.value}</div>}
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Novos pacientes + info da clínica */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICO.patients} color={C.teal} size={14} sw={2.5} /> Novos Pacientes este mês
          </div>
          {loading ? <Sk h={40} /> : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: C.teal }}>{stats?.newPatientsThisMonth ?? 0}</span>
              <span style={{ fontSize: 14, color: C.muted }}>pacientes</span>
            </div>
          )}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICO.building} color={C.teal} size={14} sw={2.5} /> Dados da Clínica
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Sk /><Sk w="70%" /></div>
          ) : clinic ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clinic.email && <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.dark, alignItems: "center" }}><Icon d={ICO.mail} size={13} color={C.muted} />{clinic.email}</div>}
              {clinic.phone && <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.dark, alignItems: "center" }}><Icon d={ICO.phone} size={13} color={C.muted} />{clinic.phone}</div>}
              {clinic.address?.city && <div style={{ fontSize: 12, color: C.muted }}>{[clinic.address.street, clinic.address.number, clinic.address.city, clinic.address.state].filter(Boolean).join(", ")}</div>}
            </div>
          ) : <p style={{ color: C.muted, fontSize: 13 }}>Sem dados</p>}
        </Card>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PSICÓLOGOS
// ═══════════════════════════════════════════════════════════════════════════════
function PsychologistsTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [psychs, setPsychs] = useState<ClinicPsychologist[]>([])
  const [selected, setSelected] = useState<ClinicPsychologist | null>(null)
  const [unlinkConfirm, setUnlinkConfirm] = useState(false)
  const [actionMsg, setActionMsg] = useState("")

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`${BASE}/clinics/${clinicId}/psychologists`, { headers: hdrs(token) })
      const data = await res.json()
      const raw: any[] = data?.data?.psychologists ?? data?.data ?? []
      setPsychs(raw)
    } catch (e: any) { setError(e.message || "Erro ao carregar psicólogos") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load() }, [load])

  const unlink = async (psychId: string) => {
    try {
      const res = await fetch(`${BASE}/clinics/${clinicId}/psychologists/${psychId}/unlink`, { method: "POST", headers: hdrs(token) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro ao desvincular") }
      setActionMsg("Psicólogo(a) desvinculado(a) com sucesso.")
      setSelected(null); setUnlinkConfirm(false); load()
    } catch (e: any) { setActionMsg(e.message || "Erro ao desvincular") }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SectionTitle>Psicólogos <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>({psychs.length})</span></SectionTitle>
        <RefreshBtn onClick={load} />
      </div>
      {error && <ErrBox msg={error} onRetry={load} />}
      {actionMsg && <div style={{ background: C.tealLight, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", color: C.teal, fontSize: 13, marginBottom: 14 }}>{actionMsg}<button onClick={() => setActionMsg("")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", marginLeft: 8, fontWeight: 700 }}>✕</button></div>}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? [1,2,3].map(i => (
            <Card key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Sk w={44} h={44} r={22} /><div style={{ flex: 1 }}><Sk w="60%" h={14} /><div style={{ marginTop: 6 }}><Sk w="40%" h={11} /></div></div>
            </Card>
          )) : psychs.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon d={ICO.psychs} color={C.muted} size={36} />
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>Nenhum psicólogo vinculado</p>
            </Card>
          ) : psychs.map(p => (
            <div key={p._id} onClick={() => { setSelected(p); setUnlinkConfirm(false) }} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1.5px solid ${selected?._id === p._id ? C.teal : "transparent"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "border-color 0.15s" }}>
              <Av name={p.name} src={p.avatar} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                {p.crp && <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>CRP: {p.crp}</div>}
                {p.specialties && p.specialties.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                    {p.specialties.slice(0, 2).map(s => <Bdg key={s} label={s} color={C.teal} />)}
                    {p.specialties.length > 2 && <Bdg label={`+${p.specialties.length - 2}`} color={C.muted} />}
                  </div>
                )}
              </div>
              {p.patientCount != null && <div style={{ textAlign: "center", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.teal }}>{p.patientCount}</div><div style={{ fontSize: 10, color: C.muted }}>pacientes</div></div>}
            </div>
          ))}
        </div>

        {/* Detalhe */}
        {selected && (
          <Card style={{ position: "sticky", top: 20, alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Detalhes</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon d={ICO.x} size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              <Av name={selected.name} src={selected.avatar} size={60} />
              <div style={{ fontWeight: 800, fontSize: 16, color: C.dark }}>{selected.name}</div>
              {selected.crp && <Bdg label={`CRP: ${selected.crp}`} color={C.teal} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
              {selected.email && <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: C.dark }}><Icon d={ICO.mail} size={14} color={C.muted} />{selected.email}</div>}
              {selected.phone && <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: C.dark }}><Icon d={ICO.phone} size={14} color={C.muted} />{selected.phone}</div>}
            </div>
            {selected.specialties && selected.specialties.length > 0 && (
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Especialidades</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{selected.specialties.map(s => <Bdg key={s} label={s} color={C.teal} />)}</div>
              </div>
            )}
            {selected.patientCount != null && (
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.teal }}>{selected.patientCount}</div>
                <div style={{ fontSize: 12, color: C.muted }}>pacientes ativos</div>
              </div>
            )}
            {!unlinkConfirm ? (
              <button onClick={() => setUnlinkConfirm(true)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid #F5C6C6`, background: "transparent", color: "#E53935", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon d={ICO.unlink} size={14} color="#E53935" /> Desvincular da clínica
              </button>
            ) : (
              <div style={{ background: "#FFF0F0", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px" }}>
                <p style={{ color: "#C62828", fontSize: 12, fontWeight: 600, margin: "0 0 10px" }}>Desvincular {selected.name}?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setUnlinkConfirm(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                  <button onClick={() => unlink(selected._id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#E53935", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Confirmar</button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PACIENTES
// ═══════════════════════════════════════════════════════════════════════════════
function PatientsTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [psychs, setPsychs] = useState<ClinicPsychologist[]>([])
  const [search, setSearch] = useState("")
  const [filterPsych, setFilterPsych] = useState<string>("all")
  const [selected, setSelected] = useState<Patient | null>(null)
  const [patStats, setPatStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState("")
  const [assignPsych, setAssignPsych] = useState<string>("")
  const [assigning, setAssigning] = useState(false)
  const [unlinkConfirm, setUnlinkConfirm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const h = hdrs(token)
      const [pRes, psychRes] = await Promise.all([
        fetch(`${BASE}/clinics/${clinicId}/patients`, { headers: h }),
        fetch(`${BASE}/clinics/${clinicId}/psychologists`, { headers: h }),
      ])
      const [pData, psychData] = await Promise.all([pRes.json(), psychRes.json()])
      setPatients(pData?.data?.patients ?? pData?.data ?? [])
      setPsychs(psychData?.data?.psychologists ?? psychData?.data ?? [])
    } catch (e: any) { setError(e.message || "Erro ao carregar pacientes") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load() }, [load])

  const selectPatient = async (p: Patient) => {
    setSelected(p); setPatStats(null); setStatsLoading(true); setUnlinkConfirm(false)
    try {
      const h = hdrs(token)
      const [aptsRes, payRes] = await Promise.all([
        fetch(`${BASE}/appointments/patient/${p._id}`, { headers: h }),
        fetch(`${BASE}/payments/summary/patient/${p._id}`, { headers: h }),
      ])
      const [aptsData, payData] = await Promise.all([aptsRes.json(), payRes.json()])
      const apts: any[] = aptsData?.data?.appointments ?? aptsData?.data ?? []
      const now = new Date()
      const next = apts.filter((a: any) => new Date(a.date || a.dateTime || 0) >= now && ["scheduled","confirmed"].includes(a.status))
        .sort((a: any,b: any) => new Date(a.date||a.dateTime).getTime()-new Date(b.date||b.dateTime).getTime())[0]
      const pay = payData?.data ?? payData ?? {}
      setPatStats({
        sessionsCount: apts.filter((a: any) => a.status === "completed").length,
        nextAppointment: next ? (next.date || next.dateTime) : null,
        totalPaid: pay.confirmedPayments?.value ?? 0,
        totalPending: pay.pendingPayments?.value ?? 0,
      })
    } catch { } finally { setStatsLoading(false) }
  }

  const assignPsychologist = async () => {
    if (!selected || !assignPsych) return
    setAssigning(true)
    try {
      const res = await fetch(`${BASE}/clinics/${clinicId}/patients/${selected._id}/assign-psychologist`, {
        method: "PUT", headers: jsonHdrs(token), body: JSON.stringify({ psychologistId: assignPsych }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg("Psicólogo(a) atribuído(a) com sucesso."); setAssignPsych(""); load()
    } catch (e: any) { setActionMsg(e.message) } finally { setAssigning(false) }
  }

  const unlinkPatient = async () => {
    if (!selected) return
    try {
      const res = await fetch(`${BASE}/clinics/${clinicId}/patients/${selected._id}/unlink`, { method: "POST", headers: hdrs(token) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg("Paciente desvinculado(a) com sucesso."); setSelected(null); setUnlinkConfirm(false); load()
    } catch (e: any) { setActionMsg(e.message) }
  }

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchPsych = filterPsych === "all" || getId(p.psychologistId) === filterPsych
    return matchSearch && matchPsych
  })

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <SectionTitle>Pacientes <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>({patients.length})</span></SectionTitle>
        <RefreshBtn onClick={load} />
      </div>
      {error && <ErrBox msg={error} onRetry={load} />}
      {actionMsg && <div style={{ background: C.tealLight, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", color: C.teal, fontSize: 13, marginBottom: 14 }}>{actionMsg}<button onClick={() => setActionMsg("")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", marginLeft: 8, fontWeight: 700 }}>✕</button></div>}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Icon d={ICO.search} color={C.muted} size={15} /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente..." style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, background: C.card, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filterPsych} onChange={e => setFilterPsych(e.target.value)} style={{ padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, background: C.card, outline: "none" }}>
          <option value="all">Todos os psicólogos</option>
          {psychs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? [1,2,3,4].map(i => (
            <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px" }}>
              <Sk w={38} h={38} r={19} /><div style={{ flex: 1 }}><Sk w="60%" h={14} /><div style={{ marginTop: 6 }}><Sk w="40%" h={11} /></div></div>
            </Card>
          )) : filtered.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon d={ICO.patients} color={C.muted} size={36} />
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>{search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}</p>
            </Card>
          ) : filtered.map(p => (
            <div key={p._id} onClick={() => selectPatient(p)} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1.5px solid ${selected?._id === p._id ? C.teal : "transparent"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "border-color 0.15s" }}>
              <Av name={p.name} src={p.avatar} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                {p.email && <div style={{ fontSize: 12, color: C.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>}
                {p.psychologistId && <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>Psicólogo(a): {getName(p.psychologistId)}</div>}
              </div>
              {p.status && <Bdg label={p.status === "active" ? "Ativo" : p.status === "new" ? "Novo" : "Inativo"} color={p.status === "active" ? C.teal : p.status === "new" ? C.amber : C.muted} />}
            </div>
          ))}
        </div>

        {selected && (
          <Card style={{ position: "sticky", top: 20, alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Detalhes</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon d={ICO.x} size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
              <Av name={selected.name} src={selected.avatar} size={52} />
              <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>{selected.name}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
              {selected.email && <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.dark, alignItems: "center" }}><Icon d={ICO.mail} size={13} color={C.muted} />{selected.email}</div>}
              {selected.phone && <div style={{ display: "flex", gap: 8, fontSize: 13, color: C.dark, alignItems: "center" }}><Icon d={ICO.phone} size={13} color={C.muted} />{selected.phone}</div>}
            </div>
            {statsLoading ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Sk key={i} h={14} />)}</div> : patStats && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Sessões", value: patStats.sessionsCount },
                  { label: "Recebido", value: fmtMoney(patStats.totalPaid) },
                  { label: "Pendente", value: fmtMoney(patStats.totalPending) },
                  { label: "Próx. consulta", value: patStats.nextAppointment ? fmtDateShort(patStats.nextAppointment) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: C.bg, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Atribuir psicólogo */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Atribuir psicólogo(a)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={assignPsych} onChange={e => setAssignPsych(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.dark, background: C.card, outline: "none" }}>
                  <option value="">Selecionar...</option>
                  {psychs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <button onClick={assignPsychologist} disabled={!assignPsych || assigning} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: assignPsych ? C.teal : "#ccc", color: "#fff", fontSize: 12, cursor: assignPsych ? "pointer" : "not-allowed", fontWeight: 700 }}>
                  {assigning ? "..." : "OK"}
                </button>
              </div>
            </div>
            {!unlinkConfirm ? (
              <button onClick={() => setUnlinkConfirm(true)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: `1px solid #F5C6C6`, background: "transparent", color: "#E53935", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Desvincular da clínica</button>
            ) : (
              <div style={{ background: "#FFF0F0", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px" }}>
                <p style={{ color: "#C62828", fontSize: 12, fontWeight: 600, margin: "0 0 10px" }}>Desvincular {selected.name}?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setUnlinkConfirm(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                  <button onClick={unlinkPatient} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: "#E53935", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Confirmar</button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: AGENDA
// ═══════════════════════════════════════════════════════════════════════════════
function ScheduleTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [psychs, setPsychs] = useState<ClinicPsychologist[]>([])
  const [apts, setApts] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterPsychIds, setFilterPsychIds] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const h = hdrs(token)
      const psychRes = await fetch(`${BASE}/clinics/${clinicId}/psychologists`, { headers: h })
      const psychData = await psychRes.json()
      const psychList: ClinicPsychologist[] = psychData?.data?.psychologists ?? psychData?.data ?? []
      setPsychs(psychList)

      const allApts: Appointment[] = []
      await Promise.all(psychList.map(async (ps) => {
        try {
          let res = await fetch(`${BASE}/psychologists/${ps._id}/appointments?limit=500`, { headers: h })
          if (!res.ok) res = await fetch(`${BASE}/appointments/psychologist/${ps._id}?limit=500`, { headers: h })
          const d = await res.json()
          const raw: any[] = d?.data?.appointments ?? d?.data ?? []
          raw.forEach(a => allApts.push({ ...a, psychologist: { name: ps.name }, patient: typeof a.patientId === "object" ? a.patientId : a.patient }))
        } catch { }
      }))
      setApts(allApts)
    } catch (e: any) { setError(e.message || "Erro ao carregar agenda") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load() }, [load])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  const visibleApts = filterPsychIds.length === 0 ? apts : apts.filter(a => filterPsychIds.includes(getId(a.psychologistId) || (a.psychologist ? psychs.find(p => p.name === a.psychologist?.name)?._id ?? "" : "")))

  const aptsByDay: Record<string, Appointment[]> = {}
  visibleApts.forEach(a => { const d = getAptDate(a).slice(0, 10); if (d) { if (!aptsByDay[d]) aptsByDay[d] = []; aptsByDay[d].push(a) } })

  const dayApts = selectedDate ? (aptsByDay[selectedDate] || []) : []

  const togglePsych = (id: string) => setFilterPsychIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SectionTitle>Agenda</SectionTitle>
        <RefreshBtn onClick={load} />
      </div>
      {error && <ErrBox msg={error} onRetry={load} />}

      {/* Filtro por psicólogo */}
      {psychs.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => setFilterPsychIds([])} style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filterPsychIds.length === 0 ? C.teal : C.card, color: filterPsychIds.length === 0 ? "#fff" : C.muted, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>Todos</button>
          {psychs.map(p => (
            <button key={p._id} onClick={() => togglePsych(p._id)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterPsychIds.includes(p._id) ? C.teal : C.card, color: filterPsychIds.includes(p._id) ? "#fff" : C.dark, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Calendário */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICO.chevL} size={16} color={C.dark} /></button>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.dark, textTransform: "capitalize" }}>{fmtMonthYear(currentDate)}</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICO.chevR} size={16} color={C.dark} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.muted, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const ds = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
              const dayAptsList = aptsByDay[ds] || []
              const isToday = ds === todayStr
              const isSel = ds === selectedDate
              return (
                <button key={ds} onClick={() => setSelectedDate(isSel ? null : ds)} style={{ aspectRatio: "1", borderRadius: 8, border: "none", cursor: "pointer", background: isSel ? C.teal : isToday ? C.tealLight : "transparent", color: isSel ? "#fff" : isToday ? C.teal : C.dark, fontWeight: isToday || isSel ? 700 : 500, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: 0, position: "relative" }}>
                  {day}
                  {dayAptsList.length > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.8)" : C.teal }} />}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {Object.entries(S_COLOR).slice(0, 4).map(([s, c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} /><span style={{ fontSize: 11, color: C.muted }}>{S_LABEL[s]}</span></div>
            ))}
          </div>
        </Card>

        {/* Consultas do dia */}
        <Card>
          {selectedDate ? (
            <>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 14px" }}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>({dayApts.length} consulta{dayApts.length !== 1 ? "s" : ""})</span>
              </h3>
              {loading ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Sk key={i} h={64} />)}</div>
                : dayApts.length === 0 ? <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Sem consultas neste dia</p>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
                    {dayApts.sort((a, b) => new Date(getAptDate(a)).getTime() - new Date(getAptDate(b)).getTime()).map(apt => (
                      <div key={apt._id} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${S_COLOR[apt.status] || "#ccc"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{fmtTime(getAptDate(apt))}</span>
                          <Bdg label={S_LABEL[apt.status] || apt.status} color={S_COLOR[apt.status] || "#ccc"} />
                        </div>
                        <div style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>{getName(apt.patientId) !== "—" ? getName(apt.patientId) : apt.patient?.name || "Paciente"}</div>
                        {apt.psychologist && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Psicólogo(a): {apt.psychologist.name}</div>}
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{apt.duration || 50} min · {apt.type === "online" ? "Online" : "Presencial"}</div>
                      </div>
                    ))}
                  </div>
                )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 0", gap: 10 }}>
              <Icon d={ICO.schedule} color={C.muted} size={32} />
              <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>Selecione um dia para ver as consultas</p>
            </div>
          )}
        </Card>
      </div>

      {/* Próximas */}
      <Card style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 14px" }}>Próximas consultas</h3>
        {loading ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Sk key={i} h={44} />)}</div> : (() => {
          const now = new Date()
          const upcoming = visibleApts.filter(a => new Date(getAptDate(a)) >= now && ["scheduled","confirmed","pending"].includes(a.status))
            .sort((a, b) => new Date(getAptDate(a)).getTime() - new Date(getAptDate(b)).getTime()).slice(0, 10)
          return upcoming.length === 0 ? <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Nenhuma consulta futura</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map(apt => (
                <div key={apt._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: C.bg }}>
                  <div style={{ textAlign: "center", minWidth: 52, background: C.card, borderRadius: 8, padding: "5px 8px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.teal }}>{fmtTime(getAptDate(apt))}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{fmtDateShort(getAptDate(apt))}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {getName(apt.patientId) !== "—" ? getName(apt.patientId) : apt.patient?.name || "Paciente"}
                    </div>
                    {apt.psychologist && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{apt.psychologist.name}</div>}
                  </div>
                  <Bdg label={S_LABEL[apt.status] || apt.status} color={S_COLOR[apt.status] || "#ccc"} />
                </div>
              ))}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: FINANCEIRO
// ═══════════════════════════════════════════════════════════════════════════════
function FinancialTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState<ClinicFinancialSummary | null>(null)
  const [sublease, setSublease] = useState<SubleaseSummary | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [period, setPeriod] = useState<"current" | "last" | "3months">("current")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionMsg, setActionMsg] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)

  const getPeriodDates = (p: typeof period) => {
    const now = new Date()
    if (p === "current") return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
    if (p === "last") return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) }
    return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
  }

  const load = useCallback(async (p: typeof period) => {
    setLoading(true); setError("")
    try {
      const { start, end } = getPeriodDates(p)
      const h = hdrs(token)
      const [sumRes, subRes, payRes] = await Promise.all([
        fetch(`${BASE}/payments/summary/clinic/${clinicId}?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, { headers: h }),
        fetch(`${BASE}/subleases/summary/clinic/${clinicId}`, { headers: h }),
        fetch(`${BASE}/payments?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=100`, { headers: h }),
      ])
      const [sumData, subData, payData] = await Promise.all([sumRes.json(), subRes.json(), payRes.json()])
      setSummary(sumData?.data ?? sumData ?? null)
      setSublease(subData?.data ?? subData ?? null)
      setPayments(payData?.data?.payments ?? payData?.data ?? [])
    } catch (e: any) { setError(e.message || "Erro ao carregar financeiro") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load(period) }, [load, period])

  const confirmPayment = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/payments/${id}/confirm`, { method: "POST", headers: hdrs(token) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg("Pagamento confirmado."); load(period)
    } catch (e: any) { setActionMsg(e.message) }
  }

  const cancelPayment = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/payments/${id}/cancel`, { method: "POST", headers: hdrs(token) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg("Pagamento cancelado."); load(period)
    } catch (e: any) { setActionMsg(e.message) }
  }

  const confirmBatch = async () => {
    if (selectedIds.length === 0) return
    setConfirming(true)
    try {
      const res = await fetch(`${BASE}/payments/batch/confirm`, { method: "POST", headers: jsonHdrs(token), body: JSON.stringify({ paymentIds: selectedIds }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg(`${selectedIds.length} pagamento(s) confirmado(s).`); setSelectedIds([]); load(period)
    } catch (e: any) { setActionMsg(e.message) } finally { setConfirming(false) }
  }

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered = statusFilter === "all" ? payments : payments.filter(p => p.status === statusFilter)
  const getPatName = (pay: PaymentData) => { if (pay.patientId && typeof pay.patientId === "object") return (pay.patientId as any).name; return "Paciente" }
  const getPsychName = (pay: PaymentData) => { if (pay.psychologistId && typeof pay.psychologistId === "object") return (pay.psychologistId as any).name; return "Psicólogo(a)" }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <SectionTitle>Financeiro</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["current","last","3months"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: period === p ? C.teal : C.card, color: period === p ? "#fff" : C.muted, boxShadow: period === p ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
              {p === "current" ? "Este mês" : p === "last" ? "Mês passado" : "3 meses"}
            </button>
          ))}
        </div>
      </div>
      {error && <ErrBox msg={error} onRetry={() => load(period)} />}
      {actionMsg && <div style={{ background: C.tealLight, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", color: C.teal, fontSize: 13, marginBottom: 14 }}>{actionMsg}<button onClick={() => setActionMsg("")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", marginLeft: 8, fontWeight: 700 }}>✕</button></div>}

      {/* Cards resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Receita Clínica",   value: summary?.clinicRevenue ?? summary?.confirmedPayments?.value, color: "#2A9D8F", border: "#2A9D8F" },
          { label: "Total Confirmado",  value: summary?.confirmedPayments?.value, color: C.dark, border: "#2A9D8F" },
          { label: "Pendente",          value: (summary?.pendingPayments?.value ?? 0) + (summary?.awaitingConfirmation?.value ?? 0), color: "#FF9800", border: "#FF9800" },
          { label: "Total Sessões",     value: summary?.totalSessions, color: "#9B8EC4", border: "#9B8EC4", raw: true },
        ].map(({ label, value, color, border, raw }) => (
          <Card key={label} style={{ borderTop: `3px solid ${border}` }}>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
            {loading ? <Sk w={100} h={24} /> : <div style={{ fontSize: 22, fontWeight: 800, color }}>{raw ? (value ?? "—") : fmtMoney(value as number)}</div>}
          </Card>
        ))}
      </div>

      {/* Sublease */}
      {sublease && (sublease.totalCost ?? 0) > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>Sublocações de Salas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Total",    value: sublease.totalCost },
              { label: "Recebido", value: sublease.paidCost },
              { label: "Pendente", value: sublease.pendingCost },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginTop: 3 }}>{fmtMoney(value)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Por psicólogo */}
      {summary?.byPsychologist && summary.byPsychologist.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>Por Psicólogo(a)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {summary.byPsychologist.map((ps, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.bg, borderRadius: 10 }}>
                <Av name={ps.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ps.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{ps.totalSessions} sessões</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2A9D8F" }}>{fmtMoney(ps.confirmed)}</div>
                  {ps.pending > 0 && <div style={{ fontSize: 11, color: "#FF9800" }}>{fmtMoney(ps.pending)} pend.</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pagamentos */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>Pagamentos <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>({filtered.length})</span></h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all","pending","awaiting_confirmation","confirmed","cancelled"].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setSelectedIds([]) }} style={{ padding: "4px 10px", borderRadius: 16, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", background: statusFilter === s ? (PAY_COLOR[s] || C.dark) : C.bg, color: statusFilter === s ? "#fff" : C.muted }}>
                {s === "all" ? "Todos" : PAY_LABEL[s] || s}
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.teal, fontWeight: 600 }}>{selectedIds.length} selecionado(s)</span>
            <button onClick={confirmBatch} disabled={confirming} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {confirming ? "Confirmando..." : "Confirmar selecionados"}
            </button>
          </div>
        )}

        {loading ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3,4].map(i => <Sk key={i} h={52} />)}</div>
          : filtered.length === 0 ? <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhum pagamento no período</p>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(pay => (
                <div key={pay._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: C.bg }}>
                  {pay.status === "awaiting_confirmation" && (
                    <input type="checkbox" checked={selectedIds.includes(pay._id)} onChange={() => toggleSelect(pay._id)} style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPatName(pay)}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{getPsychName(pay)} · {pay.dueDate ? fmtDate(pay.dueDate) : pay.paidAt ? fmtDate(pay.paidAt) : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{fmtMoney(pay.clinicAmount ?? pay.finalValue ?? pay.sessionValue)}</div>
                    <Bdg label={PAY_LABEL[pay.status] || pay.status} color={PAY_COLOR[pay.status] || "#ccc"} />
                  </div>
                  {(pay.status === "awaiting_confirmation" || pay.status === "pending") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => confirmPayment(pay._id)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#2A9D8F22", color: "#2A9D8F", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✓</button>
                      <button onClick={() => cancelPayment(pay._id)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#E5393522", color: "#E53935", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: SALAS
// ═══════════════════════════════════════════════════════════════════════════════
function RoomsTab({ token, clinicId }: { token: string; clinicId: string }) {
  const [segment, setSegment] = useState<"rooms" | "requests" | "subleases">("rooms")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [requests, setRequests] = useState<RoomRequest[]>([])
  const [subleases, setSubleases] = useState<Sublease[]>([])
  const [actionMsg, setActionMsg] = useState("")

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const h = hdrs(token)
      const [roomsRes, reqRes, subRes] = await Promise.all([
        fetch(`${BASE}/rooms?clinicId=${clinicId}`, { headers: h }),
        fetch(`${BASE}/room-requests/pending`, { headers: h }),
        fetch(`${BASE}/subleases?page=1&limit=50`, { headers: h }),
      ])
      const [roomsData, reqData, subData] = await Promise.all([roomsRes.json(), reqRes.json(), subRes.json()])
      setRooms(roomsData?.data?.rooms ?? roomsData?.data ?? [])
      setRequests(reqData?.data?.requests ?? reqData?.data ?? [])
      setSubleases(subData?.data?.subleases ?? subData?.data ?? [])
    } catch (e: any) { setError(e.message || "Erro ao carregar salas") }
    finally { setLoading(false) }
  }, [token, clinicId])

  useEffect(() => { load() }, [load])

  const handleRequest = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`${BASE}/room-requests/${id}/handle`, { method: "POST", headers: jsonHdrs(token), body: JSON.stringify({ action }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg(action === "approve" ? "Solicitação aprovada." : "Solicitação rejeitada."); load()
    } catch (e: any) { setActionMsg(e.message) }
  }

  const markPaid = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/subleases/${id}/pay`, { method: "POST", headers: hdrs(token) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      setActionMsg("Sublocação marcada como paga."); load()
    } catch (e: any) { setActionMsg(e.message) }
  }

  const pendingReqs = requests.filter(r => !r.status || r.status === "pending")
  const pendingSubs = subleases.filter(s => s.status === "pending")

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <SectionTitle>Salas</SectionTitle>
        <RefreshBtn onClick={load} />
      </div>
      {error && <ErrBox msg={error} onRetry={load} />}
      {actionMsg && <div style={{ background: C.tealLight, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "10px 14px", color: C.teal, fontSize: 13, marginBottom: 14 }}>{actionMsg}<button onClick={() => setActionMsg("")} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", marginLeft: 8, fontWeight: 700 }}>✕</button></div>}

      {/* Segmentos */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.card, borderRadius: 12, padding: 4, width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {([
          { key: "rooms",     label: "Salas",         count: rooms.length },
          { key: "requests",  label: "Solicitações",  count: pendingReqs.length },
          { key: "subleases", label: "Sublocações",   count: pendingSubs.length },
        ] as const).map(({ key, label, count }) => (
          <button key={key} onClick={() => setSegment(key)} style={{ padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: segment === key ? C.teal : "transparent", color: segment === key ? "#fff" : C.muted, display: "flex", alignItems: "center", gap: 6 }}>
            {label}
            {count > 0 && <span style={{ background: segment === key ? "rgba(255,255,255,0.3)" : C.teal + "22", color: segment === key ? "#fff" : C.teal, fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 12 }}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Salas */}
      {segment === "rooms" && (
        loading ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>{[1,2,3].map(i => <Card key={i}><Sk h={80} /></Card>)}</div>
          : rooms.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon d={ICO.door} color={C.muted} size={36} />
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>Nenhuma sala cadastrada</p>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {rooms.map(r => (
                <Card key={r._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>{r.name}</div>
                      {r.number && <div style={{ fontSize: 12, color: C.muted }}>Nº {r.number}</div>}
                    </div>
                    <Bdg label={r.isActive ? "Ativa" : "Inativa"} color={r.isActive ? "#2A9D8F" : C.muted} />
                  </div>
                  {r.capacity != null && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Capacidade: {r.capacity} pessoas</div>}
                  {r.subleasePrice != null && <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 6 }}>{fmtMoney(r.subleasePrice)}/sessão</div>}
                  {r.amenities && r.amenities.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {r.amenities.slice(0, 4).map(a => <Bdg key={a} label={a} color={C.muted} />)}
                      {r.amenities.length > 4 && <Bdg label={`+${r.amenities.length - 4}`} color={C.muted} />}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )
      )}

      {/* Solicitações */}
      {segment === "requests" && (
        loading ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3].map(i => <Card key={i}><Sk h={64} /></Card>)}</div>
          : requests.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon d={ICO.clock} color={C.muted} size={36} />
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>Nenhuma solicitação pendente</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {requests.map(req => (
                <Card key={req._id} style={{ borderLeft: `3px solid ${C.amber}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>Psicólogo(a): {getName(req.psychologistId)}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Paciente: {getName(req.patientId)}</div>
                      {(req.date || req.dateTime) && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{fmtDate(req.date || req.dateTime || "")} · {fmtTime(req.date || req.dateTime || "")} · {req.duration || 50} min</div>}
                      {req.roomId && <div style={{ fontSize: 12, color: C.teal, marginTop: 2 }}>Sala solicitada: {getName(req.roomId)}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleRequest(req._id, "approve")} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#2A9D8F22", color: "#2A9D8F", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aprovar</button>
                      <button onClick={() => handleRequest(req._id, "reject")} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#E5393522", color: "#E53935", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Rejeitar</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
      )}

      {/* Sublocações */}
      {segment === "subleases" && (
        loading ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3].map(i => <Card key={i}><Sk h={64} /></Card>)}</div>
          : subleases.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px" }}>
              <Icon d={ICO.financial} color={C.muted} size={36} />
              <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>Nenhuma sublocação encontrada</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subleases.map(sub => (
                <Card key={sub._id} style={{ borderLeft: `3px solid ${sub.status === "pending" ? C.amber : "#2A9D8F"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>Psicólogo(a): {getName(sub.psychologistId)}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Sala: {getName(sub.roomId)} · {sub.appointmentDate ? fmtDate(sub.appointmentDate) : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{fmtMoney(sub.value)}</div>
                      <Bdg label={sub.status === "pending" ? "Pendente" : sub.status === "paid" ? "Pago" : sub.status} color={sub.status === "pending" ? C.amber : sub.status === "paid" ? "#2A9D8F" : C.muted} />
                    </div>
                    {sub.status === "pending" && (
                      <button onClick={() => markPaid(sub._id)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Marcar pago</button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PERFIL
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ token, clinicId, user, onLogout }: { token: string; clinicId: string; user: HMUser; onLogout: () => void }) {
  const [loading, setLoading] = useState(true)
  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [form, setForm] = useState({ name: "", phone: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" })

  useEffect(() => {
    fetch(`${BASE}/clinics/${clinicId}`, { headers: hdrs(token) })
      .then(r => r.json()).then(d => {
        const c = d?.data ?? d ?? null; setClinic(c)
        if (c) setForm({ name: c.name || "", phone: c.phone || "", street: c.address?.street || "", number: c.address?.number || "", complement: c.address?.complement || "", neighborhood: c.address?.neighborhood || "", city: c.address?.city || "", state: c.address?.state || "", zipCode: c.address?.zipCode || "" })
      }).catch(() => {}).finally(() => setLoading(false))
  }, [token, clinicId])

  const save = async () => {
    setSaving(true); setSaveMsg("")
    try {
      const body = { name: form.name, phone: form.phone, address: { street: form.street, number: form.number, complement: form.complement, neighborhood: form.neighborhood, city: form.city, state: form.state.toUpperCase().slice(0, 2), zipCode: form.zipCode } }
      const res = await fetch(`${BASE}/clinics/${clinicId}`, { method: "PUT", headers: jsonHdrs(token), body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erro") }
      const d = await res.json(); setClinic(d?.data ?? clinic); setEditing(false); setSaveMsg("Dados atualizados com sucesso.")
    } catch (e: any) { setSaveMsg(e.message) } finally { setSaving(false) }
  }

  const handleLogout = async () => { try { await fetch(`${BASE}/auth/logout`, { method: "POST", headers: hdrs(token) }) } catch {} onLogout() }

  const inpStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, background: "#FAFAFA", outline: "none", boxSizing: "border-box" }
  const fld = (label: string, key: keyof typeof form, half?: boolean) => (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inpStyle} />
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 20 }}>Perfil da Clínica</h2>

      {saveMsg && <div style={{ background: saveMsg.includes("sucesso") ? C.tealLight : "#FFF3F3", border: `1px solid ${saveMsg.includes("sucesso") ? C.teal : "#F5C6C6"}`, borderRadius: 10, padding: "10px 14px", color: saveMsg.includes("sucesso") ? C.teal : "#C62828", fontSize: 13, marginBottom: 14 }}>{saveMsg}</div>}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 20, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
          {loading ? <Sk w={64} h={64} r={32} /> : <Av name={clinic?.name ?? user.name} src={clinic?.logo ?? user.profileImage} size={64} />}
          <div>
            {loading ? <><Sk w={160} h={20} /><div style={{ marginTop: 8 }}><Sk w={100} h={14} /></div></> : (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{clinic?.name ?? user.name}</div>
                <span style={{ display: "inline-block", marginTop: 6, background: C.tealLight, color: C.teal, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Clínica</span>
              </>
            )}
          </div>
        </div>

        {!editing ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "E-mail", value: clinic?.email ?? user.email, iconD: ICO.mail },
                { label: "Telefone", value: clinic?.phone, iconD: ICO.phone },
                { label: "CNPJ", value: clinic?.cnpj, iconD: ICO.building },
                { label: "Endereço", value: clinic?.address?.city ? [clinic.address.street, clinic.address.number, clinic.address.city, clinic.address.state].filter(Boolean).join(", ") : null, iconD: ICO.building },
              ].filter(r => r.value).map(r => (
                <div key={r.label} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={r.iconD} size={15} color={C.muted} /></div>
                  <div><div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.label}</div><div style={{ fontSize: 13, color: C.dark, marginTop: 2 }}>{r.value}</div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setEditing(true)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: C.teal, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon d={ICO.edit} size={16} color="#fff" /> Editar Dados
            </button>
          </>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {fld("Nome da Clínica", "name")}
              {fld("Telefone", "phone")}
              {fld("CEP", "zipCode", true)}
              {fld("Cidade", "city", true)}
              {fld("Rua", "street")}
              {fld("Número", "number", true)}
              {fld("Complemento", "complement", true)}
              {fld("Bairro", "neighborhood")}
              {fld("Estado (UF)", "state", true)}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: saving ? "#9BD8D0" : C.teal, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Salvando..." : "Salvar Alterações"}</button>
            </div>
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16, overflow: "hidden", padding: 0 }}>
        {[
          { label: "Central de Suporte", href: "/health-mind-app/suporte" },
          { label: "Política de Privacidade", href: "/health-mind-app/privacy" },
          { label: "Direitos Autorais", href: "/health-mind-app/copyright" },
          { label: "Site Health Mind", href: "/health-mind-app" },
        ].map(({ label, href }, i, arr) => (
          <a key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", textDecoration: "none", color: C.dark, fontSize: 14, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
            {label} <Icon d={ICO.chevR} size={14} color={C.muted} />
          </a>
        ))}
      </Card>

      <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: C.card, color: "#E53935", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 10 }}>
        <Icon d={ICO.logout} color="#E53935" size={18} /> Sair da conta
      </button>

      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid #F5C6C6`, background: "transparent", color: "#E53935", fontSize: 13, cursor: "pointer" }}>Excluir conta</button>
      ) : (
        <Card style={{ background: "#FFF0F0", border: "1px solid #F5C6C6" }}>
          <p style={{ color: "#C62828", fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}>Tem certeza? Esta ação é irreversível.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button onClick={async () => { try { await fetch(`${BASE}/auth/delete-account`, { method: "DELETE", headers: hdrs(token) }) } catch {} onLogout() }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#E53935", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Excluir</button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClinicDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<HMUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const u = getUser(); const t = getToken()
    if (!u || !t) { router.replace("/health-mind-app/login"); return }
    if (u.role !== "clinic") { router.replace("/health-mind-app/login"); return }
    setUser(u); setToken(t)
  }, [router])

  const handleLogout = () => { clearSession(); router.push("/health-mind-app/login") }

  if (!user || !token) return null

  const clinicId = user._id

  const tabs: { id: Tab; label: string; iconD: string | string[] }[] = [
    { id: "overview",      label: "Visão Geral",  iconD: ICO.overview  },
    { id: "psychologists", label: "Psicólogos",   iconD: ICO.psychs    },
    { id: "patients",      label: "Pacientes",    iconD: ICO.patients  },
    { id: "schedule",      label: "Agenda",       iconD: ICO.schedule  },
    { id: "financial",     label: "Financeiro",   iconD: ICO.financial },
    { id: "rooms",         label: "Salas",        iconD: ICO.rooms     },
    { id: "profile",       label: "Perfil",       iconD: ICO.profile   },
  ]

  const SW = 220

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-inter,system-ui,sans-serif)" }}>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 }} />}

      {/* Sidebar */}
      <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: SW, background: C.sidebar, display: "flex", flexDirection: "column", zIndex: 200, transform: `translateX(${sidebarOpen ? 0 : -SW}px)`, transition: "transform 0.25s ease" }}>
        <div style={{ padding: "20px 18px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={32} height={32} style={{ borderRadius: 8 }} />
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Health Mind</div>
            <div style={{ background: "rgba(42,157,143,0.3)", color: "#7DD4CC", fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 20, display: "inline-block", marginTop: 2 }}>Clínica</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2, background: isActive ? C.sidebarActive : "transparent", color: isActive ? "#7DD4CC" : "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: isActive ? 700 : 500, textAlign: "left", borderLeft: `3px solid ${isActive ? C.sidebarBorder : "transparent"}`, transition: "all 0.15s" }}>
                <Icon d={tab.iconD} color={isActive ? "#7DD4CC" : "rgba(255,255,255,0.5)"} size={17} />
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: "14px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Av name={user.name} src={user.profileImage} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name.split(" ")[0]}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            <Icon d={ICO.logout} size={14} color="rgba(255,255,255,0.5)" /> Sair
          </button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: 54, zIndex: 100, background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }} className="cl-topbar">
        <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}>
          <Icon d={ICO.menu} size={22} color="#fff" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="" width={24} height={24} style={{ borderRadius: 6 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
        <div style={{ width: 30 }} />
      </header>

      {/* Conteúdo */}
      <main style={{ paddingLeft: SW, paddingTop: 0 }} className="cl-main">
        <div style={{ padding: "32px 28px 60px" }}>
          {activeTab === "overview"      && <OverviewTab      token={token} clinicId={clinicId} />}
          {activeTab === "psychologists" && <PsychologistsTab token={token} clinicId={clinicId} />}
          {activeTab === "patients"      && <PatientsTab      token={token} clinicId={clinicId} />}
          {activeTab === "schedule"      && <ScheduleTab      token={token} clinicId={clinicId} />}
          {activeTab === "financial"     && <FinancialTab     token={token} clinicId={clinicId} />}
          {activeTab === "rooms"         && <RoomsTab         token={token} clinicId={clinicId} />}
          {activeTab === "profile"       && <ProfileTab       token={token} clinicId={clinicId} user={user} onLogout={handleLogout} />}
        </div>
      </main>

      <style>{`
        @keyframes cl-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @media (min-width: 768px) {
          aside { transform: translateX(0) !important; }
          .cl-topbar { display: none !important; }
          .cl-main { padding-top: 0 !important; }
        }
        @media (max-width: 767px) {
          .cl-main { padding-left: 0 !important; padding-top: 54px !important; }
        }
      `}</style>
    </div>
  )
}
