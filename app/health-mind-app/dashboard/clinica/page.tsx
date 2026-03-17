"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUser, getToken, clearSession, HMUser } from "../../lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClinicStats {
  totalPsychologists?: number
  totalPatients?: number
  totalRooms?: number
  todayAppointments?: number
  monthlyRevenue?: number
  totalRevenue?: number
  newPatientsThisMonth?: number
}

interface ClinicProfile {
  name?: string
  email?: string
  address?: { street?: string; city?: string; state?: string; number?: string }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchClinicData(token: string, userId: string) {
  const base = "/api/hm"
  const h = { Authorization: `Bearer ${token}` }

  const [profileRes, statsRes] = await Promise.all([
    fetch(`${base}/clinics/${userId}`, { headers: h }),
    fetch(`${base}/clinics/${userId}/stats`, { headers: h }),
  ])

  const [profileData, statsData] = await Promise.all([profileRes.json(), statsRes.json()])

  return {
    profile: (profileData?.data ?? {}) as ClinicProfile,
    stats: (statsData?.data ?? {}) as ClinicStats,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClinicDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<HMUser | null>(null)
  const [profile, setProfile] = useState<ClinicProfile | null>(null)
  const [stats, setStats] = useState<ClinicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const u = getUser()
    const token = getToken()
    if (!u || !token) { router.replace("/health-mind-app/login"); return }
    if (u.role !== "clinic") { router.replace("/health-mind-app/login"); return }
    setUser(u)

    fetchClinicData(token, u._id)
      .then(({ profile, stats }) => { setProfile(profile); setStats(stats) })
      .catch(e => setError(e.message || "Não foi possível carregar os dados"))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => { clearSession(); router.push("/health-mind-app/login") }

  if (!user) return null

  const displayName = profile?.name || user.name?.split(" ")[0]

  const quickStats = [
    {
      label: "Psicólogos(as)", value: stats?.totalPsychologists ?? "—",
      color: "#2A9D8F", bg: "#E8F7F6",
      path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    },
    {
      label: "Pacientes", value: stats?.totalPatients ?? "—",
      color: "#E8A0B0", bg: "#FDF0F4",
      path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    },
    {
      label: "Salas", value: stats?.totalRooms ?? "—",
      color: "#3D7A8A", bg: "#EAF3F5",
      path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    },
    {
      label: "Hoje", value: stats?.todayAppointments ?? "—",
      color: "#FF9800", bg: "#FFF4E6",
      path: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    },
  ]

  const revenue = stats?.monthlyRevenue ?? stats?.totalRevenue
  const address = profile?.address
    ? [profile.address.street, profile.address.number, profile.address.city, profile.address.state]
        .filter(Boolean).join(", ")
    : null

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
          <span style={{ background: "rgba(61,122,138,0.3)", color: "#A8D4CB", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            Clínica
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{displayName}</span>
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer",
          }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: "#1B2E35", margin: 0 }}>
            Painel da Clínica
          </h1>
          {address && (
            <p style={{ color: "#6B8088", fontSize: 13, margin: "4px 0 0" }}>{address}</p>
          )}
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

        {/* Receita + novos pacientes */}
        {!loading && (revenue !== undefined || stats?.newPatientsThisMonth !== undefined) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            {revenue !== undefined && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 12, color: "#6B8088", marginBottom: 6, fontWeight: 500 }}>Receita do Mês</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#2A9D8F" }}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(revenue)}
                </div>
              </div>
            )}
            {stats?.newPatientsThisMonth !== undefined && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 12, color: "#6B8088", marginBottom: 6, fontWeight: 500 }}>Novos Pacientes (mês)</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#E8A0B0" }}>
                  {stats.newPatientsThisMonth}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banner app */}
        <div style={{
          background: "linear-gradient(135deg, #2A9D8F 0%, #264653 100%)",
          borderRadius: 14, padding: "20px 24px", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Gestão completa no aplicativo</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Gerencie psicólogos(as), salas, pacientes e financeiro pelo app móvel</div>
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
