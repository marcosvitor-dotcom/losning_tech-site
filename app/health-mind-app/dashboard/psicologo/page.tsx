"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUser, getToken, clearSession, HMUser } from "../../lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  _id: string
  date?: string
  dateTime?: string
  duration?: number
  status: string
  patientId?: { _id: string; name: string } | string
  patient?: { name: string }
}

interface Stats {
  totalPatients: number
  todayAppointments: Appointment[]
  nextAppointment: Appointment | null
  pendingSessions: number
  completedSessions: number
  psychologistName?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPatientName(apt: Appointment) {
  if (apt.patient?.name) return apt.patient.name
  if (apt.patientId && typeof apt.patientId === "object") return apt.patientId.name
  return "Paciente"
}

function getAptDate(apt: Appointment) {
  return apt.date || apt.dateTime || ""
}

function formatTime(dt: string) {
  if (!dt) return "--:--"
  return new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(dt: string) {
  if (!dt) return "--/--"
  return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado", scheduled: "Agendado",
  completed: "Realizado", cancelled: "Cancelado",
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: "#50C878", scheduled: "#FF9800",
  completed: "#4A90E2", cancelled: "#E53935",
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchStats(token: string, userId: string): Promise<Stats> {
  const base = "/api/hm"
  const h = { Authorization: `Bearer ${token}` }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // chamadas paralelas aos endpoints reais
  const [psychRes, patientsRes, todayRes, allRes] = await Promise.all([
    fetch(`${base}/psychologists/${userId}`, { headers: h }),
    fetch(`${base}/psychologists/${userId}/patients?limit=1`, { headers: h }),
    fetch(`${base}/appointments/psychologist/${userId}?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}&limit=50`, { headers: h }),
    fetch(`${base}/appointments/psychologist/${userId}?limit=200`, { headers: h }),
  ])

  const [psychData, patientsData, todayData, allData] = await Promise.all([
    psychRes.json(), patientsRes.json(), todayRes.json(), allRes.json(),
  ])

  // Total de pacientes
  const totalPatients: number =
    patientsData?.data?.pagination?.total ??
    patientsData?.data?.patients?.length ??
    0

  // Nome do psicólogo
  const psychologistName: string = psychData?.data?.name ?? ""

  // Consultas de hoje
  const rawToday: any[] =
    todayData?.data?.appointments ?? todayData?.data ?? []
  const todayAppointments: Appointment[] = rawToday.map((a: any) => ({
    ...a,
    patient: typeof a.patientId === "object" ? a.patientId : a.patient,
  }))

  // Todos os agendamentos → próxima + contagens
  const rawAll: any[] =
    allData?.data?.appointments ?? allData?.data ?? []
  const now = new Date()

  const future = rawAll
    .filter((a: any) => {
      const d = new Date(a.date || a.dateTime || 0)
      return d >= now && ["scheduled", "confirmed"].includes(a.status)
    })
    .sort((a: any, b: any) =>
      new Date(a.date || a.dateTime).getTime() - new Date(b.date || b.dateTime).getTime()
    )

  const nextAppointment: Appointment | null = future.length > 0
    ? { ...future[0], patient: typeof future[0].patientId === "object" ? future[0].patientId : future[0].patient }
    : null

  const pendingSessions = future.length
  const completedSessions = rawAll.filter((a: any) => a.status === "completed").length

  return { totalPatients, todayAppointments, nextAppointment, pendingSessions, completedSessions, psychologistName }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PsychologistDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<HMUser | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const u = getUser()
    const token = getToken()
    if (!u || !token) { router.replace("/health-mind-app/login"); return }
    if (u.role !== "psychologist") { router.replace("/health-mind-app/login"); return }
    setUser(u)

    fetchStats(token, u._id)
      .then(setStats)
      .catch(e => setError(e.message || "Não foi possível carregar os dados"))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => { clearSession(); router.push("/health-mind-app/login") }

  if (!user) return null

  const quickStats = [
    { label: "Pacientes",  value: stats?.totalPatients ?? "—",       color: "#2A9D8F", bg: "#E8F7F6", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    { label: "Hoje",       value: stats?.todayAppointments?.length ?? "—", color: "#FF9800", bg: "#FFF4E6", path: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
    { label: "Pendentes",  value: stats?.pendingSessions ?? "—",      color: "#3D7A8A", bg: "#EAF3F5", path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" },
    { label: "Realizadas", value: stats?.completedSessions ?? "—",    color: "#E8A0B0", bg: "#FDF0F4", path: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" },
  ]

  const displayName = stats?.psychologistName?.split(" ")[0] || user.name?.split(" ")[0]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F8F8", fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      {/* Topbar */}
      <header style={{
        backgroundColor: "#1B2E35", padding: "0 24px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={30} height={30} style={{ borderRadius: 7 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Health Mind</span>
          <span style={{ background: "rgba(42,157,143,0.25)", color: "#7DD4CC", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            Psicólogo(a)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>Olá, {displayName}</span>
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer",
          }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* Saudação */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: "#1B2E35", margin: 0 }}>
            Olá, {displayName}! 👋
          </h1>
          <p style={{ color: "#6B8088", fontSize: 13, margin: "4px 0 0" }}>
            Aqui está o resumo da sua agenda
          </p>
        </div>

        {error && (
          <div style={{ background: "#FFF3F3", border: "1px solid #F5C6C6", borderRadius: 10, padding: "12px 16px", color: "#C62828", fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
          {quickStats.map(s => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 14, padding: "18px 14px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              opacity: loading ? 0.4 : 1, transition: "opacity 0.3s",
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.path} />
                </svg>
              </div>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#1B2E35" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "#6B8088", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Próxima consulta */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1B2E35", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
              </svg>
              Próxima Consulta
            </h3>
            {loading ? (
              <div style={{ height: 56, background: "#F4F8F8", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
            ) : stats?.nextAppointment ? (
              <div style={{ background: "#E8F7F6", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "center", minWidth: 48 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#2A9D8F" }}>
                    {formatTime(getAptDate(stats.nextAppointment))}
                  </div>
                  <div style={{ fontSize: 10, color: "#6B8088" }}>
                    {formatDate(getAptDate(stats.nextAppointment))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#1B2E35", fontSize: 13 }}>
                    {getPatientName(stats.nextAppointment)}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B8088", marginTop: 2 }}>
                    {stats.nextAppointment.duration || 50} min
                  </div>
                </div>
                <span style={{
                  background: (STATUS_COLOR[stats.nextAppointment.status] || "#ccc") + "22",
                  color: STATUS_COLOR[stats.nextAppointment.status] || "#ccc",
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
                }}>
                  {STATUS_LABEL[stats.nextAppointment.status] || stats.nextAppointment.status}
                </span>
              </div>
            ) : (
              <p style={{ color: "#6B8088", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                Nenhuma consulta agendada
              </p>
            )}
          </div>

          {/* Consultas de hoje */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1B2E35", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A0B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              </svg>
              Consultas de Hoje
            </h3>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: 32, background: "#F4F8F8", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (stats?.todayAppointments?.length ?? 0) === 0 ? (
              <p style={{ color: "#6B8088", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                Sem consultas hoje
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats!.todayAppointments.slice(0, 5).map(apt => (
                  <div key={apt._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3D7A8A", minWidth: 40 }}>
                      {formatTime(getAptDate(apt))}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, color: "#2C3E42" }}>
                      {getPatientName(apt)}
                    </span>
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: STATUS_COLOR[apt.status] || "#ccc",
                    }} />
                  </div>
                ))}
                {(stats?.todayAppointments?.length ?? 0) > 5 && (
                  <p style={{ fontSize: 11, color: "#6B8088", marginTop: 4 }}>
                    +{(stats!.todayAppointments.length - 5)} mais
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Banner app */}
        <div style={{
          marginTop: 20, background: "linear-gradient(135deg, #2A9D8F 0%, #3D7A8A 100%)",
          borderRadius: 14, padding: "20px 24px", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Acesso completo no aplicativo</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Gerencie pacientes, prontuários, agenda e financeiro pelo app móvel</div>
          </div>
          <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10, padding: "9px 18px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Baixar App
          </a>
        </div>

        {/* Links úteis */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { href: "/health-mind-app/suporte",   label: "Central de Suporte" },
            { href: "/health-mind-app/privacy",    label: "Privacidade" },
            { href: "/health-mind-app/copyright",  label: "Direitos Autorais" },
            { href: "/health-mind-app",            label: "Site Health Mind" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ background: "#fff", border: "1px solid #D6ECEA", borderRadius: 8, padding: "7px 12px", fontSize: 11, color: "#6B8088", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </main>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
