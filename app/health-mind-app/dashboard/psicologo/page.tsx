"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getUser, getToken, clearSession, HMUser } from "../../lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "patients" | "schedule" | "financial" | "reports" | "profile"

interface Appointment {
  _id: string
  patientId?: { _id: string; name: string; email?: string; avatar?: string } | string
  patient?: { _id?: string; name: string; email?: string; avatar?: string }
  date?: string
  dateTime?: string
  duration?: number
  status: string
  type?: string
  notes?: string
}

interface Patient {
  _id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  status?: string
}

interface PatientStats {
  sessionsCount: number
  nextAppointment?: string
  lastAppointment?: string
  totalPaid: number
  totalPending: number
}

interface PaymentData {
  _id: string
  appointmentId?: string | object
  patientId?: string | { _id: string; name: string }
  sessionValue?: number
  clinicPercentage?: number
  psychologistAmount?: number
  finalValue?: number
  status: string
  paymentMethod?: string
  dueDate?: string
  paidAt?: string
}

interface FinancialSummary {
  confirmedEarnings?: number
  pendingEarnings?: number
  expectedEarnings?: number
  cancelledPayments?: number
  confirmedPayments?: { count: number; value: number }
  pendingPayments?: { count: number; value: number }
  awaitingConfirmation?: { count: number; value: number }
}

interface TherapeuticReport {
  _id: string
  patientId: string | { _id: string; name: string }
  status: string
  summary?: string
  messagesAnalyzed?: number
  periodStart?: string
  periodEnd?: string
  createdAt?: string
  sections?: {
    temasAbordados?: string
    sentimentosIdentificados?: string
    padroesComportamentais?: string
    pontosDeAtencao?: string
    evolucaoObservada?: string
    sugestoesParaSessao?: string
  }
}

interface PsychologistProfile {
  _id: string
  name: string
  email: string
  phone?: string
  crp?: string
  specialties?: string[]
  avatar?: string
  bio?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE = "/api/hm"
const h = (token: string) => ({ Authorization: `Bearer ${token}` })

function getAptDate(apt: Appointment) { return apt.dateTime || apt.date || "" }
function getPatientName(apt: Appointment): string {
  if (apt.patient?.name) return apt.patient.name
  if (apt.patientId && typeof apt.patientId === "object") return (apt.patientId as any).name
  return "Paciente"
}
function fmtTime(dt: string) {
  if (!dt) return "--:--"
  return new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
function fmtDate(dt: string) {
  if (!dt) return "--"
  return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function fmtDateShort(dt: string) {
  if (!dt) return "--"
  return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}
function fmtMoney(v?: number) {
  if (v == null) return "R$ --"
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
function fmtMonthYear(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado", scheduled: "Agendado", completed: "Realizado",
  cancelled: "Cancelado", pending: "Pendente", awaiting_patient: "Aguard. paciente",
  awaiting_psychologist: "Aguard. psicólogo", no_show: "Não compareceu",
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: "#2A9D8F", scheduled: "#FF9800", completed: "#4A90E2",
  cancelled: "#E53935", pending: "#9B8EC4", awaiting_patient: "#FF9800",
  awaiting_psychologist: "#FF9800", no_show: "#E53935",
}
const PAY_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente", awaiting_confirmation: "Aguard. confirmação",
  confirmed: "Confirmado", cancelled: "Cancelado", refunded: "Reembolsado",
}
const PAY_STATUS_COLOR: Record<string, string> = {
  pending: "#FF9800", awaiting_confirmation: "#9B8EC4",
  confirmed: "#2A9D8F", cancelled: "#E53935", refunded: "#6B8088",
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F2F5F7",
  sidebar: "#1B2E35",
  sidebarHover: "rgba(255,255,255,0.07)",
  sidebarActive: "rgba(42,157,143,0.18)",
  sidebarActiveBorder: "#2A9D8F",
  card: "#fff",
  teal: "#2A9D8F",
  tealLight: "#E8F7F6",
  dark: "#1B2E35",
  muted: "#6B8088",
  border: "#E8EDEF",
  rose: "#C2748F",
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function Icon({ d, size = 18, color = "currentColor", stroke = 2 }: { d: string | string[]; size?: number; color?: string; stroke?: number }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

const ICONS = {
  overview:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  patients:  ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  schedule:  ["M8 2v4M16 2v4M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  financial: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  reports:   ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z", "M14 2v6h6", "M16 13H8M16 17H8M10 9H8"],
  profile:   ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  logout:    ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  refresh:   "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  search:    ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"],
  clock:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  check:     "M20 6L9 17l-5-5",
  x:         "M18 6L6 18M6 6l12 12",
  brain:     "M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.13 7.59L16 21H8l-.87-2.41A9 9 0 0 1 3 11a9 9 0 0 1 9-9z",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  chevLeft:  "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  phone:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6z",
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  sparkle:   "M12 3l1.09 3.36L16.5 6l-2.59 2.5.77 3.5L12 10.35 9.32 12l.77-3.5L7.5 6l3.41-.64L12 3z",
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:     ["M3 6h18", "M19 6l-1 14H6L5 6", "M8 6V4h8v2"],
  upload:    ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "#E8EDEF", animation: "hm-pulse 1.4s ease-in-out infinite" }} />
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 36 }: { name: string; avatar?: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
  if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #2A9D8F, #9B8EC4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, iconD, color, bg, loading }: { label: string; value: string | number; iconD: string | string[]; color: string; bg: string; loading: boolean }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon d={iconD} color={color} size={20} />
      </div>
      <div>
        {loading ? <Skeleton w={60} h={22} /> : <div style={{ fontSize: 24, fontWeight: 800, color: C.dark, lineHeight: 1 }}>{value}</div>}
        <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [psych, setPsych] = useState<PsychologistProfile | null>(null)
  const [todayApts, setTodayApts] = useState<Appointment[]>([])
  const [nextApt, setNextApt] = useState<Appointment | null>(null)
  const [totalPatients, setTotalPatients] = useState(0)
  const [pendingSessions, setPendingSessions] = useState(0)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [pendingRevenue, setPendingRevenue] = useState(0)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const headers = h(token)
      const today = new Date(); today.setHours(0,0,0,0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

      const [psychRes, patientsRes, todayRes, allRes, finRes] = await Promise.all([
        fetch(`${BASE}/psychologists/${userId}`, { headers }),
        fetch(`${BASE}/psychologists/${userId}/patients?limit=1`, { headers }),
        fetch(`${BASE}/appointments/psychologist/${userId}?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}&limit=50`, { headers }),
        fetch(`${BASE}/appointments/psychologist/${userId}?limit=500`, { headers }),
        fetch(`${BASE}/payments/summary/psychologist/${userId}?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`, { headers }),
      ])

      const [psychData, patientsData, todayData, allData, finData] = await Promise.all([
        psychRes.json(), patientsRes.json(), todayRes.json(), allRes.json(), finRes.json(),
      ])

      setPsych(psychData?.data ?? null)

      const total = patientsData?.data?.pagination?.total ?? patientsData?.data?.patients?.length ?? 0
      setTotalPatients(total)

      const rawToday: any[] = todayData?.data?.appointments ?? todayData?.data ?? []
      setTodayApts(rawToday.map((a: any) => ({ ...a, patient: typeof a.patientId === "object" ? a.patientId : a.patient })))

      const rawAll: any[] = allData?.data?.appointments ?? allData?.data ?? []
      const now = new Date()
      const future = rawAll
        .filter((a: any) => new Date(a.date || a.dateTime || 0) >= now && ["scheduled", "confirmed"].includes(a.status))
        .sort((a: any, b: any) => new Date(a.date || a.dateTime).getTime() - new Date(b.date || b.dateTime).getTime())
      setNextApt(future[0] ? { ...future[0], patient: typeof future[0].patientId === "object" ? future[0].patientId : future[0].patient } : null)
      setPendingSessions(future.length)
      setCompletedSessions(rawAll.filter((a: any) => a.status === "completed").length)

      const fin = finData?.data ?? finData ?? {}
      setMonthRevenue(fin.confirmedEarnings ?? fin.confirmedPayments?.value ?? 0)
      setPendingRevenue(fin.pendingEarnings ?? fin.pendingPayments?.value ?? 0)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  useEffect(() => { load() }, [load])

  const stats = [
    { label: "Pacientes",  value: totalPatients,     iconD: ICONS.patients,  color: "#2A9D8F", bg: "#E8F7F6" },
    { label: "Hoje",       value: todayApts.length,  iconD: ICONS.schedule,  color: "#FF9800", bg: "#FFF4E6" },
    { label: "Pendentes",  value: pendingSessions,   iconD: ICONS.clock,     color: "#9B8EC4", bg: "#F2F0FA" },
    { label: "Realizadas", value: completedSessions, iconD: ICONS.check,     color: "#2A9D8F", bg: "#E8F7F6" },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: 0 }}>
          Olá, {psych?.name?.split(" ")[0] ?? "—"}! 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Resumo do seu dia e da sua agenda</p>
      </div>

      {error && <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 20 }}>{error} <button onClick={load} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Tentar novamente</button></div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Receita do mês */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #2A9D8F, #1B7A6E)", borderRadius: 14, padding: "20px 18px", color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Recebido este mês</div>
          {loading ? <Skeleton w={120} h={28} /> : <div style={{ fontSize: 26, fontWeight: 800 }}>{fmtMoney(monthRevenue)}</div>}
        </div>
        <div style={{ background: "linear-gradient(135deg, #9B8EC4, #7A6FA8)", borderRadius: 14, padding: "20px 18px", color: "#fff" }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Pendente de pagamento</div>
          {loading ? <Skeleton w={120} h={28} /> : <div style={{ fontSize: 26, fontWeight: 800 }}>{fmtMoney(pendingRevenue)}</div>}
        </div>
      </div>

      {/* Próxima consulta + Hoje */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Próxima */}
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICONS.clock} color={C.teal} size={14} stroke={2.5} /> Próxima Consulta
          </h3>
          {loading ? <Skeleton h={60} /> : nextApt ? (
            <div style={{ background: C.tealLight, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "center", minWidth: 52 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.teal }}>{fmtTime(getAptDate(nextApt))}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{fmtDateShort(getAptDate(nextApt))}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.dark, fontSize: 13 }}>{getPatientName(nextApt)}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{nextApt.duration || 50} min · {nextApt.type === "online" ? "Online" : "Presencial"}</div>
              </div>
              <Badge label={STATUS_LABEL[nextApt.status] || nextApt.status} color={STATUS_COLOR[nextApt.status] || "#ccc"} />
            </div>
          ) : <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Nenhuma consulta agendada</p>}
        </div>

        {/* Hoje */}
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={ICONS.schedule} color={C.rose} size={14} stroke={2.5} /> Consultas de Hoje
          </h3>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Skeleton key={i} h={28} />)}</div>
          ) : todayApts.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Sem consultas hoje</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayApts.slice(0, 5).map(apt => (
                <div key={apt._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.teal, minWidth: 42 }}>{fmtTime(getAptDate(apt))}</span>
                  <span style={{ flex: 1, fontSize: 12, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPatientName(apt)}</span>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: STATUS_COLOR[apt.status] || "#ccc", flexShrink: 0 }} />
                </div>
              ))}
              {todayApts.length > 5 && <p style={{ fontSize: 11, color: C.muted }}>+{todayApts.length - 5} mais</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PACIENTES
// ═══════════════════════════════════════════════════════════════════════════════
function PatientsTab({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Patient | null>(null)
  const [patStats, setPatStats] = useState<PatientStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`${BASE}/psychologists/${userId}/patients`, { headers: h(token) })
      const data = await res.json()
      const raw: any[] = data?.data?.patients ?? data?.data ?? []
      setPatients(raw)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar pacientes")
    } finally { setLoading(false) }
  }, [token, userId])

  useEffect(() => { load() }, [load])

  const selectPatient = async (p: Patient) => {
    setSelected(p); setPatStats(null); setStatsLoading(true)
    try {
      const [aptsRes, payRes] = await Promise.all([
        fetch(`${BASE}/appointments/patient/${p._id}`, { headers: h(token) }),
        fetch(`${BASE}/payments/summary/patient/${p._id}`, { headers: h(token) }),
      ])
      const [aptsData, payData] = await Promise.all([aptsRes.json(), payRes.json()])
      const apts: any[] = aptsData?.data?.appointments ?? aptsData?.data ?? []
      const now = new Date()
      const nextApt = apts.filter((a: any) => new Date(a.date || a.dateTime || 0) >= now && ["scheduled","confirmed"].includes(a.status))
        .sort((a: any,b: any) => new Date(a.date||a.dateTime).getTime() - new Date(b.date||b.dateTime).getTime())[0]
      const lastApt = apts.filter((a: any) => a.status === "completed")
        .sort((a: any,b: any) => new Date(b.date||b.dateTime).getTime() - new Date(a.date||a.dateTime).getTime())[0]
      const pay = payData?.data ?? payData ?? {}
      setPatStats({
        sessionsCount: apts.filter((a: any) => a.status === "completed").length,
        nextAppointment: nextApt ? (nextApt.date || nextApt.dateTime) : undefined,
        lastAppointment: lastApt ? (lastApt.date || lastApt.dateTime) : undefined,
        totalPaid: pay.confirmedPayments?.value ?? pay.totalPaid ?? 0,
        totalPending: pay.pendingPayments?.value ?? pay.totalPending ?? 0,
      })
    } catch { /* ignore */ } finally { setStatsLoading(false) }
  }

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 16 }}>
      {/* Lista */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>Pacientes <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>({patients.length})</span></h2>
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <Icon d={ICONS.search} color={C.muted} size={15} />
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente..." style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, background: C.card, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={load} style={{ background: C.tealLight, border: "none", borderRadius: 10, padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.teal, fontSize: 13, fontWeight: 600 }}>
            <Icon d={ICONS.refresh} size={14} color={C.teal} /> Atualizar
          </button>
        </div>

        {error && <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <Skeleton w={38} h={38} r={19} />
                <div style={{ flex: 1 }}><Skeleton w="60%" h={14} /><div style={{ marginTop: 6 }}><Skeleton w="40%" h={11} /></div></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
            <Icon d={ICONS.patients} color={C.muted} size={36} />
            <p style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>{search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(p => (
              <div key={p._id} onClick={() => selectPatient(p)} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1.5px solid ${selected?._id === p._id ? C.teal : "transparent"}`, transition: "border-color 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Avatar name={p.name} avatar={p.avatar} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  {p.email && <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>}
                </div>
                {p.status && <Badge label={p.status === "active" ? "Ativo" : p.status === "new" ? "Novo" : "Inativo"} color={p.status === "active" ? C.teal : p.status === "new" ? "#FF9800" : C.muted} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalhe do paciente */}
      {selected && (
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", position: "sticky", top: 20, alignSelf: "start" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>Detalhes</h3>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
              <Icon d={ICONS.x} size={16} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <Avatar name={selected.name} avatar={selected.avatar} size={56} />
            <div style={{ fontWeight: 800, fontSize: 16, color: C.dark, textAlign: "center" }}>{selected.name}</div>
            {selected.status && <Badge label={selected.status === "active" ? "Ativo" : selected.status === "new" ? "Novo" : "Inativo"} color={selected.status === "active" ? C.teal : selected.status === "new" ? "#FF9800" : C.muted} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            {selected.email && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon d={ICONS.mail} size={14} color={C.muted} /><span style={{ fontSize: 13, color: C.dark }}>{selected.email}</span></div>}
            {selected.phone && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon d={ICONS.phone} size={14} color={C.muted} /><span style={{ fontSize: 13, color: C.dark }}>{selected.phone}</span></div>}
          </div>
          {statsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3,4].map(i => <Skeleton key={i} h={14} />)}</div>
          ) : patStats && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Sessões realizadas", value: patStats.sessionsCount },
                { label: "Recebido", value: fmtMoney(patStats.totalPaid) },
                { label: "Pendente", value: fmtMoney(patStats.totalPending) },
                { label: "Última sessão", value: patStats.lastAppointment ? fmtDateShort(patStats.lastAppointment) : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginTop: 4 }}>{value}</div>
                </div>
              ))}
              {patStats.nextAppointment && (
                <div style={{ background: C.tealLight, borderRadius: 10, padding: "10px 12px", gridColumn: "span 2" }}>
                  <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Próxima consulta</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginTop: 4 }}>{fmtDate(patStats.nextAppointment)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: AGENDA
// ═══════════════════════════════════════════════════════════════════════════════
function ScheduleTab({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`${BASE}/appointments/psychologist/${userId}?limit=500`, { headers: h(token) })
      const data = await res.json()
      const raw: any[] = data?.data?.appointments ?? data?.data ?? []
      setAppointments(raw.map((a: any) => ({ ...a, patient: typeof a.patientId === "object" ? a.patientId : a.patient })))
    } catch (e: any) {
      setError(e.message || "Erro ao carregar agenda")
    } finally { setLoading(false) }
  }, [token, userId])

  useEffect(() => { load() }, [load])

  // Calcula dias do mês atual
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  // Mapa: "YYYY-MM-DD" → appointments
  const aptsByDay: Record<string, Appointment[]> = {}
  appointments.forEach(a => {
    const d = (a.date || a.dateTime || "").slice(0, 10)
    if (d) { if (!aptsByDay[d]) aptsByDay[d] = []; aptsByDay[d].push(a) }
  })

  const selectedDateStr = selectedDate
  const dayApts = selectedDateStr ? (aptsByDay[selectedDateStr] || []) : []
  const filteredDayApts = filterStatus === "all" ? dayApts : dayApts.filter(a => a.status === filterStatus)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const todayStr = new Date().toISOString().slice(0, 10)

  const allStatuses = [...new Set(appointments.map(a => a.status))]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>Agenda</h2>
        <button onClick={load} style={{ background: C.tealLight, border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.teal, fontSize: 13, fontWeight: 600 }}>
          <Icon d={ICONS.refresh} size={14} color={C.teal} /> Atualizar
        </button>
      </div>

      {error && <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        {/* Calendário */}
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* Header mês */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={ICONS.chevLeft} size={16} color={C.dark} />
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.dark, textTransform: "capitalize" }}>{fmtMonthYear(currentDate)}</span>
            <button onClick={nextMonth} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={ICONS.chevRight} size={16} color={C.dark} />
            </button>
          </div>

          {/* Dias da semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.muted, padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Grid dos dias */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const dayAptsList = aptsByDay[dateStr] || []
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDate
              const hasApts = dayAptsList.length > 0

              return (
                <button key={dateStr} onClick={() => setSelectedDate(isSelected ? null : dateStr)} style={{
                  position: "relative", aspectRatio: "1", borderRadius: 8, border: "none", cursor: "pointer",
                  background: isSelected ? C.teal : isToday ? C.tealLight : "transparent",
                  color: isSelected ? "#fff" : isToday ? C.teal : C.dark,
                  fontWeight: isToday || isSelected ? 700 : 500,
                  fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: 0,
                }}>
                  {day}
                  {hasApts && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.8)" : C.teal }} />}
                </button>
              )
            })}
          </div>

          {/* Legenda */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 16 }}>
            {Object.entries(STATUS_COLOR).slice(0, 4).map(([s, c]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 11, color: C.muted }}>{STATUS_LABEL[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral: consultas do dia */}
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {selectedDate ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 8px" }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                </h3>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 8px", color: C.dark, background: C.bg, outline: "none" }}>
                  <option value="all">Todos os status</option>
                  {allStatuses.map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
                </select>
              </div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Skeleton key={i} h={60} />)}</div>
              ) : filteredDayApts.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                  {dayApts.length === 0 ? "Sem consultas neste dia" : "Nenhuma consulta com este status"}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredDayApts.sort((a, b) => new Date(getAptDate(a)).getTime() - new Date(getAptDate(b)).getTime()).map(apt => (
                    <div key={apt._id} style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid ${STATUS_COLOR[apt.status] || "#ccc"}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{fmtTime(getAptDate(apt))}</span>
                        <Badge label={STATUS_LABEL[apt.status] || apt.status} color={STATUS_COLOR[apt.status] || "#ccc"} />
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{getPatientName(apt)}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{apt.duration || 50} min · {apt.type === "online" ? "Online" : "Presencial"}</div>
                      {apt.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontStyle: "italic" }}>"{apt.notes}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, padding: "40px 0" }}>
              <Icon d={ICONS.schedule} color={C.muted} size={32} />
              <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>Selecione um dia no calendário para ver as consultas</p>
            </div>
          )}
        </div>
      </div>

      {/* Próximas consultas */}
      <div style={{ background: C.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 14px" }}>Próximas consultas</h3>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Skeleton key={i} h={48} />)}</div>
        ) : (() => {
          const now = new Date()
          const upcoming = appointments
            .filter(a => new Date(getAptDate(a)) >= now && ["scheduled","confirmed","pending"].includes(a.status))
            .sort((a,b) => new Date(getAptDate(a)).getTime() - new Date(getAptDate(b)).getTime())
            .slice(0, 8)
          return upcoming.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "16px 0" }}>Nenhuma consulta futura</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map(apt => (
                <div key={apt._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: C.bg }}>
                  <div style={{ textAlign: "center", minWidth: 52, background: C.card, borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.teal }}>{fmtTime(getAptDate(apt))}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{fmtDateShort(getAptDate(apt))}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPatientName(apt)}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{apt.duration || 50} min · {apt.type === "online" ? "Online" : "Presencial"}</div>
                  </div>
                  <Badge label={STATUS_LABEL[apt.status] || apt.status} color={STATUS_COLOR[apt.status] || "#ccc"} />
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: FINANCEIRO
// ═══════════════════════════════════════════════════════════════════════════════
function FinancialTab({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [period, setPeriod] = useState<"current" | "last" | "3months">("current")

  const getPeriodDates = (p: typeof period) => {
    const now = new Date()
    if (p === "current") {
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
    } else if (p === "last") {
      return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) }
    } else {
      return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
    }
  }

  const load = useCallback(async (p: typeof period) => {
    setLoading(true); setError("")
    try {
      const { start, end } = getPeriodDates(p)
      const [summaryRes, paymentsRes] = await Promise.all([
        fetch(`${BASE}/payments/summary/psychologist/${userId}?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, { headers: h(token) }),
        fetch(`${BASE}/payments?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=50`, { headers: h(token) }),
      ])
      const [summaryData, paymentsData] = await Promise.all([summaryRes.json(), paymentsRes.json()])
      setSummary(summaryData?.data ?? summaryData ?? null)
      const raw: any[] = paymentsData?.data?.payments ?? paymentsData?.data ?? []
      setPayments(raw)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar financeiro")
    } finally { setLoading(false) }
  }, [token, userId])

  useEffect(() => { load(period) }, [load, period])

  const getPatientNameFromPayment = (pay: PaymentData) => {
    if (pay.patientId && typeof pay.patientId === "object") return (pay.patientId as any).name
    return "Paciente"
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>Financeiro</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {(["current", "last", "3months"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: period === p ? C.teal : C.card, color: period === p ? "#fff" : C.muted, boxShadow: period === p ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
              {p === "current" ? "Este mês" : p === "last" ? "Mês passado" : "3 meses"}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {/* Cards de resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Recebido", value: summary?.confirmedEarnings ?? summary?.confirmedPayments?.value, color: "#2A9D8F", bg: "#E8F7F6" },
          { label: "Pendente", value: summary?.pendingEarnings ?? summary?.pendingPayments?.value, color: "#FF9800", bg: "#FFF4E6" },
          { label: "Previsto", value: summary?.expectedEarnings, color: "#9B8EC4", bg: "#F2F0FA" },
          { label: "Cancelado", value: summary?.cancelledPayments, color: "#E53935", bg: "#FFF0F0" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: C.card, borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
            {loading ? <Skeleton w={100} h={24} /> : <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>{fmtMoney(value)}</div>}
          </div>
        ))}
      </div>

      {/* Lista de pagamentos */}
      <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 16px" }}>
          Pagamentos <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>({payments.length})</span>
        </h3>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3,4,5].map(i => <Skeleton key={i} h={52} />)}</div>
        ) : payments.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhum pagamento no período</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {payments.map(pay => (
              <div key={pay._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: C.bg }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPatientNameFromPayment(pay)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {pay.paymentMethod && `${pay.paymentMethod} · `}
                    {pay.dueDate ? fmtDate(pay.dueDate) : pay.paidAt ? fmtDate(pay.paidAt) : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{fmtMoney(pay.psychologistAmount ?? pay.finalValue ?? pay.sessionValue)}</div>
                  <Badge label={PAY_STATUS_LABEL[pay.status] || pay.status} color={PAY_STATUS_COLOR[pay.status] || "#ccc"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: RELATÓRIOS
// ═══════════════════════════════════════════════════════════════════════════════
function ReportsTab({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [reports, setReports] = useState<TherapeuticReport[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<TherapeuticReport | null>(null)
  const [finData, setFinData] = useState<{ monthRevenue: number; yearRevenue: number; completedSessions: number; pendingSessions: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const now = new Date()
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      const startYear = new Date(now.getFullYear(), 0, 1)

      const [patientsRes, aptsRes, finMonthRes, finYearRes] = await Promise.all([
        fetch(`${BASE}/psychologists/${userId}/patients`, { headers: h(token) }),
        fetch(`${BASE}/appointments/psychologist/${userId}?limit=500`, { headers: h(token) }),
        fetch(`${BASE}/payments/summary/psychologist/${userId}?startDate=${startMonth.toISOString()}&endDate=${endMonth.toISOString()}`, { headers: h(token) }),
        fetch(`${BASE}/payments/summary/psychologist/${userId}?startDate=${startYear.toISOString()}&endDate=${endMonth.toISOString()}`, { headers: h(token) }),
      ])

      const [patientsData, aptsData, finMonthData, finYearData] = await Promise.all([
        patientsRes.json(), aptsRes.json(), finMonthRes.json(), finYearRes.json(),
      ])

      const rawPat: any[] = patientsData?.data?.patients ?? patientsData?.data ?? []
      setPatients(rawPat)

      const rawApts: any[] = aptsData?.data?.appointments ?? aptsData?.data ?? []
      const fin = finMonthData?.data ?? finMonthData ?? {}
      const finYear = finYearData?.data ?? finYearData ?? {}
      setFinData({
        monthRevenue: fin.confirmedEarnings ?? fin.confirmedPayments?.value ?? 0,
        yearRevenue: finYear.confirmedEarnings ?? finYear.confirmedPayments?.value ?? 0,
        completedSessions: rawApts.filter((a: any) => a.status === "completed").length,
        pendingSessions: rawApts.filter((a: any) => ["scheduled","confirmed","pending"].includes(a.status)).length,
      })
    } catch (e: any) {
      setError(e.message || "Erro ao carregar relatórios")
    } finally { setLoading(false) }
  }, [token, userId])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (reportId: string, alreadyHasSections: boolean) => {
    if (expanded === reportId) { setExpanded(null); setExpandedDetail(null); return }
    setExpanded(reportId)
    if (alreadyHasSections) return
    try {
      const res = await fetch(`${BASE}/ai/therapeutic-report/${reportId}`, { headers: h(token) })
      const data = await res.json()
      const detail: TherapeuticReport = data?.data ?? data
      setExpandedDetail(detail)
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, ...detail } : r))
    } catch { /* show summary only */ }
  }

  const loadReports = async (patientId: string) => {
    setSelectedPatient(patientId); setReports([]); setExpanded(null); setExpandedDetail(null)
    try {
      const res = await fetch(`${BASE}/ai/therapeutic-reports/${patientId}`, { headers: h(token) })
      const data = await res.json()
      // API returns { success, data: { reports: [...], total } } or { success, data: [...] }
      const payload = data?.data ?? data
      const raw: any[] = payload?.reports ?? (Array.isArray(payload) ? payload : [])
      setReports(raw)
    } catch { setReports([]) }
  }

  const generateReport = async () => {
    if (!selectedPatient) return
    setGenerating(true); setGenMsg("")
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 160000) // 2m40s
      let res: Response
      try {
        res = await fetch(`${BASE}/ai/generate-therapeutic-report`, {
          method: "POST",
          headers: { ...h(token), "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: selectedPatient }),
          signal: controller.signal,
        })
      } finally { clearTimeout(timeout) }
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || "Erro ao gerar relatório")
      setGenMsg("Relatório gerado com sucesso!")
      await loadReports(selectedPatient)
    } catch (e: any) {
      if (e.name === "AbortError") {
        setGenMsg("A geração demorou muito. Aguarde alguns minutos e atualize a lista.")
      } else {
        setGenMsg(e.message || "Erro ao gerar relatório")
      }
    } finally { setGenerating(false) }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, margin: 0 }}>Relatórios</h2>
        <button onClick={load} style={{ background: C.tealLight, border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.teal, fontSize: 13, fontWeight: 600 }}>
          <Icon d={ICONS.refresh} size={14} color={C.teal} /> Atualizar
        </button>
      </div>

      {error && <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {/* Cards de stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Receita do mês", value: fmtMoney(finData?.monthRevenue), color: "#2A9D8F", bg: "#E8F7F6", iconD: ICONS.financial },
          { label: "Receita do ano",  value: fmtMoney(finData?.yearRevenue),  color: "#9B8EC4", bg: "#F2F0FA", iconD: ICONS.star },
          { label: "Sessões realizadas", value: finData?.completedSessions ?? "—", color: "#2A9D8F", bg: "#E8F7F6", iconD: ICONS.check },
          { label: "Sessões pendentes",  value: finData?.pendingSessions ?? "—",   color: "#FF9800", bg: "#FFF4E6", iconD: ICONS.clock },
        ].map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* Relatórios terapêuticos IA */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Lista de pacientes */}
        <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Icon d={ICONS.brain} color={C.teal} size={16} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>Relatórios IA por paciente</h3>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3,4].map(i => <Skeleton key={i} h={38} />)}</div>
          ) : patients.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>Nenhum paciente</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
              {patients.map(p => (
                <button key={p._id} onClick={() => loadReports(p._id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: selectedPatient === p._id ? C.tealLight : "transparent", textAlign: "left", width: "100%" }}>
                  <Avatar name={p.name} avatar={p.avatar} size={28} />
                  <span style={{ fontSize: 13, fontWeight: selectedPatient === p._id ? 700 : 500, color: selectedPatient === p._id ? C.teal : C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Relatórios do paciente selecionado */}
        <div style={{ background: C.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {!selectedPatient ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, padding: "40px 0" }}>
              <Icon d={ICONS.brain} color={C.muted} size={36} />
              <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>Selecione um paciente para ver ou gerar relatórios terapêuticos com IA</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>
                  Relatórios de {patients.find(p => p._id === selectedPatient)?.name || ""}
                </h3>
                <button onClick={generateReport} disabled={generating} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer", background: generating ? "#ccc" : C.teal, color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  <Icon d={ICONS.sparkle} size={14} color="#fff" />
                  {generating ? "Gerando..." : "Gerar novo relatório IA"}
                </button>
              </div>

              {genMsg && <div style={{ background: genMsg.includes("sucesso") ? C.tealLight : "#FFF3F3", border: `1px solid ${genMsg.includes("sucesso") ? C.teal : "#F5C6C6"}`, borderRadius: 10, padding: "10px 14px", color: genMsg.includes("sucesso") ? C.teal : "#C62828", fontSize: 12, marginBottom: 14 }}>{genMsg}</div>}

              {reports.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhum relatório gerado ainda. Clique em "Gerar novo relatório IA" para criar um.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reports.map(r => (
                    <div key={r._id} style={{ background: C.bg, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <button onClick={() => r.status === "completed" && toggleExpand(r._id, !!r.sections)} disabled={r.status !== "completed"} style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: r.status === "completed" ? "pointer" : "default", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: r.status === "completed" ? C.tealLight : r.status === "generating" ? "#FFF4E6" : "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon d={r.status === "completed" ? ICONS.check : r.status === "generating" ? ICONS.clock : ICONS.x} color={r.status === "completed" ? C.teal : r.status === "generating" ? "#FF9800" : "#E53935"} size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>
                            {r.periodStart && r.periodEnd ? `${fmtDate(r.periodStart)} — ${fmtDate(r.periodEnd)}` : r.createdAt ? fmtDate(r.createdAt) : "Relatório terapêutico"}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            {r.messagesAnalyzed ? `${r.messagesAnalyzed} mensagens analisadas · ` : ""}{r.status === "completed" ? "Concluído" : r.status === "generating" ? "Gerando..." : "Falhou"}
                          </div>
                        </div>
                        <Icon d={expanded === r._id ? ICONS.chevLeft : ICONS.chevRight} size={14} color={C.muted} />
                      </button>
                      {expanded === r._id && (
                        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                          {r.summary && (
                            <div style={{ background: C.tealLight, borderRadius: 10, padding: "10px 14px", margin: "12px 0 14px" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Resumo</div>
                              <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{r.summary}</p>
                            </div>
                          )}
                          {r.sections && (() => {
                            const sections = [
                              { key: "temasAbordados",         label: "Temas Abordados",           color: "#4A90E2", bg: "#EBF4FD" },
                              { key: "sentimentosIdentificados", label: "Sentimentos Identificados", color: "#E91E63", bg: "#FCE4EC" },
                              { key: "padroesComportamentais",  label: "Padrões Comportamentais",   color: "#FF9800", bg: "#FFF3E0" },
                              { key: "pontosDeAtencao",         label: "Pontos de Atenção",          color: "#E53935", bg: "#FFEBEE" },
                              { key: "evolucaoObservada",       label: "Evolução Observada",         color: "#2A9D8F", bg: "#E0F7F4" },
                              { key: "sugestoesParaSessao",     label: "Sugestões para a Sessão",    color: "#9C27B0", bg: "#F3E5F5" },
                            ]
                            return (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {sections.map(s => {
                                  const text = (r.sections as any)[s.key]
                                  if (!text) return null
                                  return (
                                    <div key={s.key} style={{ background: s.bg, borderRadius: 10, padding: "10px 14px" }}>
                                      <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                                      <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })()}
                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Relatório gerado por IA · Dados clínicos criptografados
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: PERFIL
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ token, userId, user, onLogout }: { token: string; userId: string; user: HMUser; onLogout: () => void }) {
  const [loading, setLoading] = useState(true)
  const [psych, setPsych] = useState<PsychologistProfile | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/psychologists/${userId}`, { headers: h(token) })
      .then(r => r.json())
      .then(d => setPsych(d?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, userId])

  const handleLogout = async () => {
    try { await fetch(`${BASE}/auth/logout`, { method: "POST", headers: h(token) }) } catch {}
    onLogout()
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 20 }}>Perfil</h2>

      {/* Card principal */}
      <div style={{ background: C.card, borderRadius: 16, padding: "28px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          {loading ? <Skeleton w={64} h={64} r={32} /> : <Avatar name={psych?.name ?? user.name} avatar={psych?.avatar ?? user.profileImage} size={64} />}
          <div>
            {loading ? <><Skeleton w={160} h={20} /><div style={{ marginTop: 8 }}><Skeleton w={120} h={14} /></div></> : (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{psych?.name ?? user.name}</div>
                <div style={{ display: "inline-block", marginTop: 6, background: C.tealLight, color: C.teal, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>Psicólogo(a)</div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "E-mail", value: psych?.email ?? user.email, iconD: ICONS.mail },
            { label: "Telefone", value: psych?.phone, iconD: ICONS.phone },
            { label: "CRP", value: psych?.crp, iconD: ICONS.reports },
            { label: "Bio", value: psych?.bio, iconD: ICONS.edit },
          ].filter(row => row.value).map(row => (
            <div key={row.label} style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={row.iconD} size={16} color={C.muted} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</div>
                <div style={{ fontSize: 14, color: C.dark, marginTop: 2 }}>{row.value}</div>
              </div>
            </div>
          ))}
          {psych?.specialties && psych.specialties.length > 0 && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={ICONS.star} size={16} color={C.muted} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Especialidades</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {psych.specialties.map(s => <Badge key={s} label={s} color={C.teal} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links úteis */}
      <div style={{ background: C.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 16 }}>
        {[
          { label: "Central de Suporte", href: "/health-mind-app/suporte" },
          { label: "Política de Privacidade", href: "/health-mind-app/privacy" },
          { label: "Direitos Autorais", href: "/health-mind-app/copyright" },
          { label: "Site Health Mind", href: "/health-mind-app" },
        ].map(({ label, href }, i, arr) => (
          <a key={href} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", textDecoration: "none", color: C.dark, fontSize: 14, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
            {label} <Icon d={ICONS.chevRight} size={14} color={C.muted} />
          </a>
        ))}
      </div>

      {/* Ações */}
      <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: C.card, color: "#E53935", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: 10 }}>
        <Icon d={ICONS.logout} color="#E53935" size={18} /> Sair da conta
      </button>

      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid #F5C6C6`, background: "transparent", color: "#E53935", fontSize: 13, cursor: "pointer" }}>
          Excluir conta
        </button>
      ) : (
        <div style={{ background: "#FFF0F0", border: "1px solid #F5C6C6", borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ color: "#C62828", fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}>Tem certeza? Esta ação é irreversível.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.dark, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button onClick={async () => {
              try { await fetch(`${BASE}/accounts`, { method: "DELETE", headers: h(token) }) } catch {}
              onLogout()
            }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#E53935", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Excluir</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function PsychologistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<HMUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const u = getUser(); const t = getToken()
    if (!u || !t) { router.replace("/health-mind-app/login"); return }
    if (u.role !== "psychologist") { router.replace("/health-mind-app/login"); return }
    setUser(u); setToken(t)
  }, [router])

  const handleLogout = () => { clearSession(); router.push("/health-mind-app/login") }

  if (!user || !token) return null

  const tabs: { id: Tab; label: string; iconD: string | string[] }[] = [
    { id: "overview",  label: "Visão Geral", iconD: ICONS.overview  },
    { id: "patients",  label: "Pacientes",   iconD: ICONS.patients  },
    { id: "schedule",  label: "Agenda",      iconD: ICONS.schedule  },
    { id: "financial", label: "Financeiro",  iconD: ICONS.financial },
    { id: "reports",   label: "Relatórios",  iconD: ICONS.reports   },
    { id: "profile",   label: "Perfil",      iconD: ICONS.profile   },
  ]

  const SIDEBAR_W = 220

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
        background: C.sidebar, display: "flex", flexDirection: "column", zIndex: 200,
        transform: `translateX(${sidebarOpen ? 0 : -SIDEBAR_W}px)`,
        transition: "transform 0.25s ease",
      }}
      // Desktop: always visible via CSS media override is not available here,
      // so we use a CSS class trick via global style below
      >
        {/* Logo */}
        <div style={{ padding: "20px 18px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={32} height={32} style={{ borderRadius: 8 }} />
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Health Mind</div>
            <div style={{ background: "rgba(42,157,143,0.3)", color: "#7DD4CC", fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 20, display: "inline-block", marginTop: 2 }}>Psicólogo(a)</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 2,
                background: isActive ? C.sidebarActive : "transparent",
                color: isActive ? "#7DD4CC" : "rgba(255,255,255,0.6)",
                fontSize: 14, fontWeight: isActive ? 700 : 500, textAlign: "left",
                borderLeft: `3px solid ${isActive ? C.sidebarActiveBorder : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <Icon d={tab.iconD} color={isActive ? "#7DD4CC" : "rgba(255,255,255,0.5)"} size={17} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "14px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Avatar name={user.name} avatar={user.profileImage} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name.split(" ")[0]}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            <Icon d={ICONS.logout} size={14} color="rgba(255,255,255,0.5)" /> Sair
          </button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 54, zIndex: 100,
        background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }} className="hm-topbar">
        <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}>
          <Icon d={ICONS.reports} size={22} color="#fff" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="" width={24} height={24} style={{ borderRadius: 6 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
        <div style={{ width: 30 }} />
      </header>

      {/* Conteúdo principal */}
      <main style={{ paddingLeft: SIDEBAR_W, paddingTop: 0 }} className="hm-main">
        <div style={{ padding: "32px 28px 60px" }}>
          {activeTab === "overview"  && <OverviewTab  token={token} userId={user._id} />}
          {activeTab === "patients"  && <PatientsTab  token={token} userId={user._id} />}
          {activeTab === "schedule"  && <ScheduleTab  token={token} userId={user._id} />}
          {activeTab === "financial" && <FinancialTab token={token} userId={user._id} />}
          {activeTab === "reports"   && <ReportsTab   token={token} userId={user._id} />}
          {activeTab === "profile"   && <ProfileTab   token={token} userId={user._id} user={user} onLogout={handleLogout} />}
        </div>
      </main>

      <style>{`
        @keyframes hm-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

        /* Desktop: sidebar sempre visível */
        @media (min-width: 768px) {
          aside { transform: translateX(0) !important; }
          .hm-topbar { display: none !important; }
          .hm-main { padding-top: 0 !important; }
        }

        /* Mobile: topbar visível, main sem padding-left */
        @media (max-width: 767px) {
          .hm-main { padding-left: 0 !important; padding-top: 54px !important; }
        }
      `}</style>
    </div>
  )
}
