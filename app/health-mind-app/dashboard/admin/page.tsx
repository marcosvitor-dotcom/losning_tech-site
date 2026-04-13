"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getUser, getToken, clearSession } from "../../lib/auth"

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminStats {
  totals: { clinics: number; psychologists: number; patients: number; admins: number }
  activeUsers: { clinics: number; psychologists: number; patients: number; total: number }
  newThisMonth: { clinics: number; psychologists: number; patients: number; total: number }
  appointmentsThisMonth: number
}

interface AdminClinic {
  _id: string
  name: string
  email: string
  phone?: string
  cnpj?: string
  address?: string
  psychologistCount?: number
  patientCount?: number
  deletedAt?: string | null
  createdAt?: string
}

interface AdminPsychologist {
  _id: string
  name: string
  email: string
  crp?: string
  phone?: string
  clinic?: { _id: string; name: string }
  deletedAt?: string | null
  createdAt?: string
}

interface AdminPatient {
  _id: string
  name: string
  email: string
  phone?: string
  psychologist?: { _id: string; name: string }
  deletedAt?: string | null
  createdAt?: string
}

interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'admin'
  permissions?: {
    manageUsers: boolean
    manageClinics: boolean
    viewMetrics: boolean
    promoteAdmin: boolean
  }
  createdBy?: { _id: string; name: string; email: string }
  lastLoginAt?: string
}

interface AdminSubscription {
  _id: string
  userId: { _id: string; name: string; email: string; role: string }
  planKey: string
  status: 'active' | 'overdue' | 'blocked' | 'cancelled' | 'none'
  isTrial: boolean
  trialEndsAt: string | null
  billing: { monthlyAmount: number; nextBillingDate: string }
}

type Tab = 'overview' | 'clinics' | 'users' | 'invites' | 'subscriptions' | 'settings'
type UsersSubTab = 'psychologists' | 'patients' | 'admins'
type ClinicFilter = 'active' | 'deleted' | 'all'
type SubStatus = 'all' | 'active' | 'overdue' | 'blocked' | 'trial'

// ─── Types (Plans) ───────────────────────────────────────────────────────────

interface Plan {
  key: string
  name: string
  userType: 'psychologist' | 'clinic'
  pricing: { setupFee: number; monthly: number }
  limits: { patients: number | null; invitedPatients: number; psychologists: number | null }
}

// ─── Plan loader ──────────────────────────────────────────────────────────────

async function fetchPlans(): Promise<Plan[]> {
  try {
    const data = await adminFetch('/subscriptions/plans')
    return data.plans || []
  } catch {
    return []
  }
}

const colors = {
  primary: '#E74C3C',
  blue: '#3498DB',
  purple: '#9B59B6',
  green: '#27AE60',
  orange: '#E67E22',
  bg: '#F5F5F5',
  sidebar: '#1B2631',
  sidebarActive: '#E74C3C',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  border: '#E8E8E8',
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function adminFetch(path: string, opts?: RequestInit) {
  const token = getToken()
  const res = await fetch(`/api/hm${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts?.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Erro na requisição')
  return data.data
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/health-mind-app/login'); return }
    if (u.role !== 'admin') { router.replace('/health-mind-app/login'); return }
    setUser(u)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.replace('/health-mind-app/login')
  }

  if (!user) return <LoadingScreen />

  const isSuperAdmin = user?.permissions?.promoteAdmin

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'clinics', label: 'Clínicas', icon: '🏥' },
    { id: 'users', label: 'Usuários', icon: '👥' },
    { id: 'invites', label: 'Convites', icon: '✉️' },
    { id: 'subscriptions', label: 'Assinaturas', icon: '💳' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: colors.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        backgroundColor: colors.sidebar,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/health-mind-app/images/favicon.png" alt="HM" width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
            {sidebarOpen && (
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Health Mind</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.primary, display: 'inline-block' }} />
                  <span style={{ color: colors.primary, fontSize: 11, fontWeight: 600 }}>Admin</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', color: 'rgba(255,255,255,0.4)', textAlign: sidebarOpen ? 'right' : 'center', fontSize: 18 }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 2,
                backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.55)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{tab.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 6 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              backgroundColor: colors.primary,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: 0.5,
            }}>
              🛡️ {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'overview' && <OverviewTab user={user} onNavigate={setActiveTab} />}
          {activeTab === 'clinics' && <ClinicsTab />}
          {activeTab === 'users' && <UsersTab isSuperAdmin={isSuperAdmin} currentUser={user} />}
          {activeTab === 'invites' && <InvitesTab isSuperAdmin={isSuperAdmin} />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'settings' && <SettingsTab user={user} onLogout={handleLogout} />}
        </div>
      </main>
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1B2631' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Carregando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.white, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ backgroundColor: bg, color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
      {label}
    </span>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ user, onNavigate }: { user: any; onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await adminFetch('/admin/dashboard/stats')
      setStats(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <TabLoading />
  if (error) return <TabError message={error} onRetry={load} />

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: colors.textLight, margin: 0 }}>Bem-vindo de volta,</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: '4px 0 0' }}>{user?.name || 'Administrador'}</h2>
      </div>

      {/* Totais */}
      <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Totais do Sistema</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard icon="🏥" label="Clínicas" value={stats?.totals.clinics || 0} color="#EBF5FB" />
        <StatCard icon="🧠" label="Psicólogos" value={stats?.totals.psychologists || 0} color="#F4ECF7" />
        <StatCard icon="🫂" label="Pacientes" value={stats?.totals.patients || 0} color="#EAFAF1" />
        <StatCard icon="🛡️" label="Admins" value={stats?.totals.admins || 0} color="#FDEDEC" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Usuários Ativos */}
        <SectionCard title="Usuários Ativos (30 dias)">
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
            {[
              { label: 'Clínicas', value: stats?.activeUsers.clinics || 0 },
              { label: 'Psicólogos', value: stats?.activeUsers.psychologists || 0 },
              { label: 'Pacientes', value: stats?.activeUsers.patients || 0 },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{item.value}</div>
                <div style={{ fontSize: 12, color: colors.textLight, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: colors.textLight }}>Total de usuários ativos</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: colors.primary }}>{stats?.activeUsers.total || 0}</span>
          </div>
        </SectionCard>

        {/* Novos este mês */}
        <SectionCard title="Novos este Mês">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#EAFAF1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              📈
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 700, color: colors.green, lineHeight: 1 }}>{stats?.newThisMonth.total || 0}</div>
              <div style={{ fontSize: 13, color: colors.textLight }}>novos usuários</div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
            <span style={{ fontSize: 13, color: colors.textLight }}>
              {stats?.newThisMonth.clinics || 0} clínicas • {stats?.newThisMonth.psychologists || 0} psicólogos • {stats?.newThisMonth.patients || 0} pacientes
            </span>
          </div>
        </SectionCard>
      </div>

      {/* Consultas */}
      <div style={{
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        boxShadow: '0 4px 16px rgba(231,76,60,0.3)',
      }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          📅
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stats?.appointmentsThisMonth || 0}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>consultas este mês</div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Ações Rápidas</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { icon: '➕', label: 'Convidar Clínica', color: colors.blue, tab: 'invites' as Tab },
          { icon: '🏥', label: 'Ver Clínicas', color: colors.purple, tab: 'clinics' as Tab },
          { icon: '👥', label: 'Ver Usuários', color: colors.green, tab: 'users' as Tab },
          { icon: '💳', label: 'Assinaturas', color: colors.orange, tab: 'subscriptions' as Tab },
        ].map(action => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: action.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Clinics Tab ──────────────────────────────────────────────────────────────

function ClinicsTab() {
  const [clinics, setClinics] = useState<AdminClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ClinicFilter>('active')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<AdminClinic | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (filter === 'deleted') params.append('includeDeleted', 'true')
      const data = await adminFetch(`/admin/clinics?${params}`)
      let list: AdminClinic[] = data.clinics || []
      if (filter === 'active') list = list.filter((c: AdminClinic) => !c.deletedAt)
      else if (filter === 'deleted') list = list.filter((c: AdminClinic) => c.deletedAt)
      setClinics(list)
      setTotalPages(data.pagination?.pages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar esta clínica?')) return
    setActionLoading(id)
    try {
      await adminFetch(`/admin/clinics/${id}`, { method: 'DELETE' })
      showToast('Clínica desativada')
      load()
      if (selected?._id === id) setSelected(null)
    } catch (e: any) {
      showToast(e.message, false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async (id: string) => {
    setActionLoading(id)
    try {
      await adminFetch(`/admin/clinics/${id}/restore`, { method: 'POST' })
      showToast('Clínica restaurada')
      load()
      if (selected?._id === id) setSelected(null)
    } catch (e: any) {
      showToast(e.message, false)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar clínica..."
          style={inputStyle}
        />
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['active', 'deleted', 'all'] as ClinicFilter[]).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={filterBtn(filter === f)}>
              {f === 'active' ? 'Ativas' : f === 'deleted' ? 'Deletadas' : 'Todas'}
            </button>
          ))}
        </div>
        <button onClick={load} style={refreshBtn}>🔄 Atualizar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* List */}
        <div>
          {loading ? <TabLoading /> : error ? <TabError message={error} onRetry={load} /> : (
            <>
              <div style={{ marginBottom: 12, fontSize: 13, color: colors.textLight }}>{total} clínica{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {clinics.length === 0 ? (
                  <EmptyState message="Nenhuma clínica encontrada" />
                ) : clinics.map(clinic => (
                  <div
                    key={clinic._id}
                    onClick={() => setSelected(selected?._id === clinic._id ? null : clinic)}
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: 10,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      border: `1.5px solid ${selected?._id === clinic._id ? colors.primary : colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      opacity: clinic.deletedAt ? 0.65 : 1,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{clinic.name}</span>
                        {clinic.deletedAt && <Badge label="Desativada" color="#E74C3C" bg="#FDEDEC" />}
                      </div>
                      <div style={{ fontSize: 12, color: colors.textLight, marginTop: 3 }}>{clinic.email}</div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: colors.textLight }}>👥 {clinic.psychologistCount || 0} psicólogos</span>
                        <span style={{ fontSize: 12, color: colors.textLight }}>🫂 {clinic.patientCount || 0} pacientes</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {clinic.deletedAt ? (
                        <ActionBtn label="Restaurar" color={colors.green} loading={actionLoading === clinic._id} onClick={e => { e.stopPropagation(); handleRestore(clinic._id) }} />
                      ) : (
                        <ActionBtn label="Desativar" color={colors.primary} loading={actionLoading === clinic._id} onClick={e => { e.stopPropagation(); handleDelete(clinic._id) }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
            </>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ backgroundColor: colors.white, borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', alignSelf: 'start', position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors.textLight }}>✕</button>
            </div>
            {selected.deletedAt && (
              <div style={{ backgroundColor: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#E74C3C' }}>
                ⚠️ Clínica desativada em {new Date(selected.deletedAt).toLocaleDateString('pt-BR')}
              </div>
            )}
            <DetailRow label="E-mail" value={selected.email} />
            {selected.phone && <DetailRow label="Telefone" value={selected.phone} />}
            {selected.cnpj && <DetailRow label="CNPJ" value={selected.cnpj} />}
            {selected.address && <DetailRow label="Endereço" value={selected.address} />}
            {selected.createdAt && <DetailRow label="Cadastro" value={new Date(selected.createdAt).toLocaleDateString('pt-BR')} />}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1, backgroundColor: '#EBF5FB', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.blue }}>{selected.psychologistCount || 0}</div>
                <div style={{ fontSize: 11, color: colors.textLight }}>Psicólogos</div>
              </div>
              <div style={{ flex: 1, backgroundColor: '#EAFAF1', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.green }}>{selected.patientCount || 0}</div>
                <div style={{ fontSize: 11, color: colors.textLight }}>Pacientes</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {selected.deletedAt ? (
                <button onClick={() => handleRestore(selected._id)} disabled={actionLoading === selected._id} style={fullBtn(colors.green)}>
                  {actionLoading === selected._id ? 'Restaurando...' : '✓ Restaurar Clínica'}
                </button>
              ) : (
                <button onClick={() => handleDelete(selected._id)} disabled={actionLoading === selected._id} style={fullBtn(colors.primary)}>
                  {actionLoading === selected._id ? 'Desativando...' : '✕ Desativar Clínica'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ isSuperAdmin, currentUser }: { isSuperAdmin: boolean; currentUser: any }) {
  const [subTab, setSubTab] = useState<UsersSubTab>('psychologists')
  const [psychologists, setPsychologists] = useState<AdminPsychologist[]>([])
  const [patients, setPatients] = useState<AdminPatient[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.append('search', search)
      if (includeDeleted) params.append('includeDeleted', 'true')

      if (subTab === 'psychologists') {
        const data = await adminFetch(`/admin/psychologists?${params}`)
        setPsychologists(data.psychologists || [])
        setTotalPages(data.pagination?.pages || 1)
      } else if (subTab === 'patients') {
        const data = await adminFetch(`/admin/patients?${params}`)
        setPatients(data.patients || [])
        setTotalPages(data.pagination?.pages || 1)
      } else if (subTab === 'admins') {
        const data = await adminFetch(`/admin/admins?${params}`)
        setAdmins(data.admins || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [subTab, search, page, includeDeleted])

  useEffect(() => { setPage(1); setSearch('') }, [subTab])
  useEffect(() => { load() }, [load])

  const handleDeletePsycho = async (id: string) => {
    if (!confirm('Desativar este psicólogo?')) return
    setActionLoading(id)
    try {
      await adminFetch(`/admin/psychologists/${id}`, { method: 'DELETE' })
      showToast('Psicólogo desativado')
      load()
    } catch (e: any) { showToast(e.message, false) }
    finally { setActionLoading(null) }
  }

  const handleRestorePsycho = async (id: string) => {
    setActionLoading(id)
    try {
      await adminFetch(`/admin/psychologists/${id}/restore`, { method: 'POST' })
      showToast('Psicólogo restaurado')
      load()
    } catch (e: any) { showToast(e.message, false) }
    finally { setActionLoading(null) }
  }

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Desativar este paciente?')) return
    setActionLoading(id)
    try {
      await adminFetch(`/admin/patients/${id}`, { method: 'DELETE' })
      showToast('Paciente desativado')
      load()
    } catch (e: any) { showToast(e.message, false) }
    finally { setActionLoading(null) }
  }

  const handleRestorePatient = async (id: string) => {
    setActionLoading(id)
    try {
      await adminFetch(`/admin/patients/${id}/restore`, { method: 'POST' })
      showToast('Paciente restaurado')
      load()
    } catch (e: any) { showToast(e.message, false) }
    finally { setActionLoading(null) }
  }

  const handleRevokeAdmin = async (id: string) => {
    if (!confirm('Revogar este administrador?')) return
    setActionLoading(id)
    try {
      await adminFetch(`/admin/admins/${id}`, { method: 'DELETE' })
      showToast('Admin revogado')
      load()
    } catch (e: any) { showToast(e.message, false) }
    finally { setActionLoading(null) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, backgroundColor: colors.white, padding: 4, borderRadius: 10, width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {[
          { id: 'psychologists' as UsersSubTab, label: '🧠 Psicólogos' },
          { id: 'patients' as UsersSubTab, label: '🫂 Pacientes' },
          ...(isSuperAdmin ? [{ id: 'admins' as UsersSubTab, label: '🛡️ Admins' }] : []),
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: subTab === t.id ? 600 : 400,
            backgroundColor: subTab === t.id ? colors.primary : 'transparent',
            color: subTab === t.id ? '#fff' : colors.textLight,
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {subTab !== 'admins' && (
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={`Buscar ${subTab === 'psychologists' ? 'psicólogo' : 'paciente'}...`} style={inputStyle} />
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textLight, cursor: 'pointer' }}>
          <input type="checkbox" checked={includeDeleted} onChange={e => { setIncludeDeleted(e.target.checked); setPage(1) }} />
          Incluir desativados
        </label>
        {subTab === 'admins' && isSuperAdmin && (
          <button onClick={() => setShowCreateAdmin(true)} style={{ ...filterBtn(false), backgroundColor: colors.primary, color: '#fff', border: 'none' }}>
            ➕ Novo Admin
          </button>
        )}
        <button onClick={load} style={refreshBtn}>🔄 Atualizar</button>
      </div>

      {loading ? <TabLoading /> : error ? <TabError message={error} onRetry={load} /> : (
        <>
          {subTab === 'psychologists' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {psychologists.length === 0 ? <EmptyState message="Nenhum psicólogo encontrado" /> :
                psychologists.map(p => (
                  <UserCard key={p._id}
                    name={p.name} email={p.email}
                    sub={p.clinic ? `Clínica: ${p.clinic.name}` : p.crp ? `CRP: ${p.crp}` : undefined}
                    deleted={!!p.deletedAt}
                    loading={actionLoading === p._id}
                    onDelete={() => handleDeletePsycho(p._id)}
                    onRestore={() => handleRestorePsycho(p._id)}
                    icon="🧠"
                  />
                ))
              }
            </div>
          )}
          {subTab === 'patients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patients.length === 0 ? <EmptyState message="Nenhum paciente encontrado" /> :
                patients.map(p => (
                  <UserCard key={p._id}
                    name={p.name} email={p.email}
                    sub={p.psychologist ? `Psicólogo: ${p.psychologist.name}` : undefined}
                    deleted={!!p.deletedAt}
                    loading={actionLoading === p._id}
                    onDelete={() => handleDeletePatient(p._id)}
                    onRestore={() => handleRestorePatient(p._id)}
                    icon="🫂"
                  />
                ))
              }
            </div>
          )}
          {subTab === 'admins' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {admins.length === 0 ? <EmptyState message="Nenhum administrador encontrado" /> :
                admins.map(a => (
                  <div key={a._id} style={{
                    backgroundColor: colors.white, borderRadius: 10, padding: '14px 18px',
                    border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#FDEDEC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>{a.name}</span>
                          {a.permissions?.promoteAdmin && <Badge label="Super Admin" color="#E74C3C" bg="#FDEDEC" />}
                        </div>
                        <div style={{ fontSize: 12, color: colors.textLight }}>{a.email}</div>
                        {a.permissions && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {a.permissions.manageClinics && <Badge label="Clínicas" color={colors.blue} bg="#EBF5FB" />}
                            {a.permissions.manageUsers && <Badge label="Usuários" color={colors.green} bg="#EAFAF1" />}
                            {a.permissions.viewMetrics && <Badge label="Métricas" color={colors.purple} bg="#F4ECF7" />}
                          </div>
                        )}
                      </div>
                    </div>
                    {a._id !== currentUser?._id && (
                      <ActionBtn label="Revogar" color={colors.primary} loading={actionLoading === a._id} onClick={() => handleRevokeAdmin(a._id)} />
                    )}
                  </div>
                ))
              }
            </div>
          )}
          {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
        </>
      )}

      {showCreateAdmin && (
        <CreateAdminModal onClose={() => setShowCreateAdmin(false)} onCreated={() => { setShowCreateAdmin(false); load() }} />
      )}
    </div>
  )
}

// ─── Invites Tab ──────────────────────────────────────────────────────────────

function InvitesTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [mode, setMode] = useState<'hub' | 'clinic' | 'psychologist'>('hub')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  if (mode === 'clinic') {
    return <InviteClinicForm onBack={() => setMode('hub')} onSuccess={msg => { showToast(msg); setMode('hub') }} onError={msg => showToast(msg, false)} toast={toast} />
  }
  if (mode === 'psychologist') {
    return <InvitePsychologistForm onBack={() => setMode('hub')} onSuccess={msg => { showToast(msg); setMode('hub') }} onError={msg => showToast(msg, false)} isSuperAdmin={isSuperAdmin} toast={toast} />
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />
      <div style={{ backgroundColor: '#EBF5FB', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <p style={{ margin: 0, fontSize: 13, color: '#2471A3' }}>
          Os convites enviam um e-mail com link de cadastro. O usuário cria sua conta e já pode acessar a plataforma com o plano atribuído.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 640 }}>
        <InviteCard
          icon="🏥"
          title="Convidar Clínica"
          description="Envie um convite para uma clínica se cadastrar na plataforma com plano e acesso imediato."
          color={colors.blue}
          onClick={() => setMode('clinic')}
        />
        <InviteCard
          icon="🧠"
          title="Convidar Psicólogo"
          description="Envie um convite para um psicólogo autônomo se cadastrar com plano individual."
          color={colors.purple}
          onClick={() => setMode('psychologist')}
        />
      </div>
    </div>
  )
}

function InviteCard({ icon, title, description, color, onClick }: { icon: string; title: string; description: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: colors.white, borderRadius: 14, padding: 24, cursor: 'pointer',
      border: `1.5px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left',
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = color }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = colors.border }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: colors.textLight, lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{ color: color, fontSize: 13, fontWeight: 600 }}>Enviar convite →</div>
    </button>
  )
}

function InviteClinicForm({ onBack, onSuccess, onError, toast }: { onBack: () => void; onSuccess: (msg: string) => void; onError: (msg: string) => void; toast: any }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [planKey, setPlanKey] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPlans().then(all => setPlans(all.filter(p => p.userType === 'clinic')))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'E-mail obrigatório'
    if (!name.trim()) errs.name = 'Nome obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await adminFetch('/invitations/clinic', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), name: name.trim(), cnpj: cnpj.trim() || undefined, planKey: planKey || undefined }),
      })
      onSuccess('Convite enviado com sucesso!')
    } catch (e: any) { onError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>← Voltar</button>
      <div style={{ maxWidth: 500 }}>
        <SectionCard title="🏥 Convidar Clínica">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="E-mail *" error={errors.email}>
              <input value={email} onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })) }} placeholder="clinica@email.com" style={inputStyle} />
            </FormField>
            <FormField label="Nome da Clínica *" error={errors.name}>
              <input value={name} onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })) }} placeholder="Nome da clínica" style={inputStyle} />
            </FormField>
            <FormField label="CNPJ (opcional)">
              <input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" style={inputStyle} />
            </FormField>
            <FormField label="Plano (opcional)">
              <select value={planKey} onChange={e => setPlanKey(e.target.value)} style={inputStyle}>
                <option value="">Sem plano atribuído</option>
                {plans.map(p => (
                  <option key={p.key} value={p.key}>{p.name} — R$ {p.pricing.monthly}/mês</option>
                ))}
              </select>
            </FormField>
            <button type="submit" disabled={loading} style={fullBtn(colors.blue)}>
              {loading ? 'Enviando...' : '✉️ Enviar Convite'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

function InvitePsychologistForm({ onBack, onSuccess, onError, isSuperAdmin, toast }: { onBack: () => void; onSuccess: (msg: string) => void; onError: (msg: string) => void; isSuperAdmin: boolean; toast: any }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [crp, setCrp] = useState('')
  const [phone, setPhone] = useState('')
  const [planKey, setPlanKey] = useState('')
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPlans().then(all => {
      let filtered = all.filter(p => p.userType === 'psychologist')
      if (!isSuperAdmin) filtered = filtered.filter(p => p.key !== 'psico_avaliacao')
      setAvailablePlans(filtered)
    })
  }, [isSuperAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'E-mail obrigatório'
    if (!name.trim()) errs.name = 'Nome obrigatório'
    if (!crp.trim()) errs.crp = 'CRP obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await adminFetch('/invitations/psychologist', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), name: name.trim(), crp: crp.trim(), phone: phone.trim() || undefined, planKey: planKey || undefined }),
      })
      onSuccess('Convite enviado com sucesso!')
    } catch (e: any) { onError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Toast toast={toast} />
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>← Voltar</button>
      <div style={{ maxWidth: 500 }}>
        <SectionCard title="🧠 Convidar Psicólogo">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="E-mail *" error={errors.email}>
              <input value={email} onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: '' })) }} placeholder="psicologo@email.com" style={inputStyle} />
            </FormField>
            <FormField label="Nome completo *" error={errors.name}>
              <input value={name} onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })) }} placeholder="Dr. Nome Sobrenome" style={inputStyle} />
            </FormField>
            <FormField label="CRP *" error={errors.crp}>
              <input value={crp} onChange={e => { setCrp(e.target.value); setErrors(v => ({ ...v, crp: '' })) }} placeholder="CRP 00/00000" style={inputStyle} />
            </FormField>
            <FormField label="Telefone (opcional)">
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" style={inputStyle} />
            </FormField>
            <FormField label="Plano (opcional)">
              <select value={planKey} onChange={e => setPlanKey(e.target.value)} style={inputStyle}>
                <option value="">Sem plano atribuído</option>
                {availablePlans.map(p => (
                  <option key={p.key} value={p.key}>{p.name} — R$ {p.pricing.monthly}/mês</option>
                ))}
              </select>
            </FormField>
            <button type="submit" disabled={loading} style={fullBtn(colors.purple)}>
              {loading ? 'Enviando...' : '✉️ Enviar Convite'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────

function SubscriptionsTab() {
  const [subs, setSubs] = useState<AdminSubscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SubStatus>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchPlans().then(setPlans) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      // Trial: usa o mesmo padrão do app mobile — status=active&isTrial=true
      if (statusFilter === 'trial') {
        params.append('status', 'active')
        params.append('isTrial', 'true')
      } else if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const raw = await adminFetch(`/subscriptions?${params}`)
      // A API pode retornar { subscriptions, pagination } ou o array diretamente
      const list: AdminSubscription[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.subscriptions)
          ? raw.subscriptions
          : []
      const pagination = raw?.pagination
      setSubs(list)
      setTotalPages(pagination?.pages || 1)
      setTotal(pagination?.total ?? list.length)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [statusFilter, page])

  useEffect(() => { load() }, [load])

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Ativa', color: '#27AE60', bg: '#EAFAF1' },
    overdue: { label: 'Atrasada', color: '#E67E22', bg: '#FEF9E7' },
    blocked: { label: 'Bloqueada', color: '#E74C3C', bg: '#FDEDEC' },
    cancelled: { label: 'Cancelada', color: '#95A5A6', bg: '#F2F3F4' },
    none: { label: 'Sem plano', color: '#BDC3C7', bg: '#F8F9FA' },
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'active', 'overdue', 'blocked', 'trial'] as SubStatus[]).map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} style={filterBtn(statusFilter === s)}>
            {s === 'all' ? 'Todas' : s === 'active' ? 'Ativas' : s === 'overdue' ? 'Atrasadas' : s === 'blocked' ? 'Bloqueadas' : 'Trial'}
          </button>
        ))}
        <button onClick={load} style={refreshBtn}>🔄 Atualizar</button>
      </div>

      {loading ? <TabLoading /> : error ? <TabError message={error} onRetry={load} /> : (
        <>
          <div style={{ marginBottom: 12, fontSize: 13, color: colors.textLight }}>{total} assinatura{total !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subs.length === 0 ? <EmptyState message="Nenhuma assinatura encontrada" /> :
              subs.map(sub => {
                const st = statusConfig[sub.status] || statusConfig.none
                const planLabel = plans.find(p => p.key === sub.planKey)?.name || sub.planKey
                return (
                  <div key={sub._id} style={{
                    backgroundColor: colors.white, borderRadius: 10, padding: '14px 18px',
                    border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    flexWrap: 'wrap', gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F4ECF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {sub.userId.role === 'clinic' ? '🏥' : '🧠'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>{sub.userId.name}</div>
                        <div style={{ fontSize: 12, color: colors.textLight }}>{sub.userId.email}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: colors.textLight }}>{planLabel}</span>
                          {sub.isTrial && <Badge label="Trial" color={colors.orange} bg="#FEF9E7" />}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge label={st.label} color={st.color} bg={st.bg} />
                      {sub.billing?.monthlyAmount > 0 && (
                        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, marginTop: 6 }}>
                          R$ {sub.billing.monthlyAmount.toFixed(2)}/mês
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: colors.textLight, marginTop: 2 }}>
                        {sub.isTrial && sub.trialEndsAt
                          ? `Trial até ${new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}`
                          : sub.billing?.nextBillingDate
                            ? `Próx. cobrança: ${new Date(sub.billing.nextBillingDate).toLocaleDateString('pt-BR')}`
                            : ''}
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
        </>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ user, onLogout }: { user: any; onLogout: () => void }) {
  const isSuperAdmin = user?.permissions?.promoteAdmin

  const permissions = [
    { key: 'manageClinics', label: 'Gerenciar Clínicas', icon: '🏥' },
    { key: 'manageUsers', label: 'Gerenciar Usuários', icon: '👥' },
    { key: 'viewMetrics', label: 'Visualizar Métricas', icon: '📊' },
    { key: 'promoteAdmin', label: 'Promover Admins', icon: '🛡️' },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      {/* Profile */}
      <SectionCard title="Perfil do Administrador">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{user?.name}</span>
              {isSuperAdmin && <Badge label="Super Admin" color={colors.primary} bg="#FDEDEC" />}
            </div>
            <div style={{ fontSize: 13, color: colors.textLight, marginTop: 2 }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: 600 }}>🛡️ Administrador</div>
          </div>
        </div>
      </SectionCard>

      {/* Permissions */}
      {user?.permissions && (
        <SectionCard title="Permissões">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {permissions.map(p => {
              const active = user.permissions[p.key]
              return (
                <div key={p.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 8,
                  backgroundColor: active ? '#F0FFF4' : '#FAFAFA',
                  border: `1px solid ${active ? '#A9DFBF' : colors.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ fontSize: 14, color: colors.text }}>{p.label}</span>
                  </div>
                  <span style={{ fontSize: 18 }}>{active ? '✅' : '❌'}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Info */}
      <SectionCard title="Informações">
        <DetailRow label="Versão" value="Web 1.0.0" />
        <DetailRow label="Plataforma" value="Health Mind" />
        <DetailRow label="Ambiente" value="Produção" />
      </SectionCard>

      {/* Logout */}
      <button onClick={onLogout} style={{ ...fullBtn(colors.primary), marginTop: 8 }}>
        🚪 Sair da conta
      </button>
    </div>
  )
}

// ─── Create Admin Modal ───────────────────────────────────────────────────────

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [perms, setPerms] = useState({ manageUsers: false, manageClinics: false, viewMetrics: false, promoteAdmin: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    if (!form.email.trim()) errs.email = 'E-mail obrigatório'
    if (!form.password) errs.password = 'Senha obrigatória'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setError('')
    try {
      await adminFetch('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ ...form, permissions: perms }),
      })
      onCreated()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ backgroundColor: colors.white, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Novo Administrador</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: colors.textLight }}>✕</button>
        </div>
        {error && <div style={{ backgroundColor: '#FDEDEC', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#E74C3C' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Nome *" error={errors.name}>
            <input value={form.name} onChange={e => { setForm(v => ({ ...v, name: e.target.value })); setErrors(v => ({ ...v, name: '' })) }} placeholder="Nome completo" style={inputStyle} />
          </FormField>
          <FormField label="E-mail *" error={errors.email}>
            <input type="email" value={form.email} onChange={e => { setForm(v => ({ ...v, email: e.target.value })); setErrors(v => ({ ...v, email: '' })) }} placeholder="admin@email.com" style={inputStyle} />
          </FormField>
          <FormField label="Senha *" error={errors.password}>
            <input type="password" value={form.password} onChange={e => { setForm(v => ({ ...v, password: e.target.value })); setErrors(v => ({ ...v, password: '' })) }} placeholder="Senha segura" style={inputStyle} />
          </FormField>
          <FormField label="Telefone (opcional)">
            <input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} placeholder="(00) 00000-0000" style={inputStyle} />
          </FormField>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: colors.text, display: 'block', marginBottom: 8 }}>Permissões</label>
            {[
              { key: 'manageClinics', label: 'Gerenciar Clínicas' },
              { key: 'manageUsers', label: 'Gerenciar Usuários' },
              { key: 'viewMetrics', label: 'Visualizar Métricas' },
              { key: 'promoteAdmin', label: 'Promover Admins (Super Admin)' },
            ].map(p => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 14, color: colors.text }}>
                <input type="checkbox" checked={(perms as any)[p.key]} onChange={e => setPerms(v => ({ ...v, [p.key]: e.target.checked }))} />
                {p.label}
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} style={fullBtn(colors.primary)}>
            {loading ? 'Criando...' : '➕ Criar Administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Small Helpers ────────────────────────────────────────────────────────────

function UserCard({ name, email, sub, deleted, loading, onDelete, onRestore, icon }: {
  name: string; email: string; sub?: string; deleted: boolean;
  loading: boolean; onDelete: () => void; onRestore: () => void; icon: string
}) {
  return (
    <div style={{
      backgroundColor: colors.white, borderRadius: 10, padding: '14px 18px',
      border: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)', opacity: deleted ? 0.65 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: deleted ? '#F2F3F4' : '#F4ECF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>{name}</span>
            {deleted && <Badge label="Desativado" color="#E74C3C" bg="#FDEDEC" />}
          </div>
          <div style={{ fontSize: 12, color: colors.textLight }}>{email}</div>
          {sub && <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
      {deleted
        ? <ActionBtn label="Restaurar" color={colors.green} loading={loading} onClick={onRestore} />
        : <ActionBtn label="Desativar" color={colors.primary} loading={loading} onClick={onDelete} />
      }
    </div>
  )
}

function ActionBtn({ label, color, loading, onClick }: { label: string; color: string; loading: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      backgroundColor: color + '18', color, border: `1px solid ${color}40`,
      borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
    }}>
      {loading ? '...' : label}
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: 13, color: colors.textLight }}>{label}</span>
      <span style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ color: '#E74C3C', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={filterBtn(false)}>← Anterior</button>
      <span style={{ fontSize: 13, color: colors.textLight }}>Página {page} de {total}</span>
      <button onClick={() => onChange(page + 1)} disabled={page === total} style={filterBtn(false)}>Próxima →</button>
    </div>
  )
}

function Toast({ toast }: { toast: { msg: string; ok: boolean } | null }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      backgroundColor: toast.ok ? '#27AE60' : '#E74C3C',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
      animation: 'fadeIn 0.3s ease',
    }}>
      {toast.ok ? '✓' : '✕'} {toast.msg}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

function TabLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 }}>
      <div style={{ width: 28, height: 28, border: '3px solid #eee', borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ color: colors.textLight, fontSize: 14 }}>Carregando...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: colors.textLight, marginBottom: 16 }}>{message}</p>
      <button onClick={onRetry} style={{ backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Tentar novamente</button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <p style={{ color: colors.textLight, fontSize: 14 }}>{message}</p>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: `1.5px solid ${colors.border}`,
  fontSize: 14,
  color: colors.text,
  backgroundColor: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
}

const filterBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px',
  borderRadius: 8,
  border: `1.5px solid ${active ? colors.primary : colors.border}`,
  backgroundColor: active ? colors.primary : colors.white,
  color: active ? '#fff' : colors.textLight,
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
})

const refreshBtn: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: `1.5px solid ${colors.border}`,
  backgroundColor: colors.white,
  color: colors.textLight,
  fontSize: 13,
  cursor: 'pointer',
}

const fullBtn = (color: string): React.CSSProperties => ({
  width: '100%',
  padding: '12px',
  borderRadius: 10,
  border: 'none',
  backgroundColor: color,
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
})
