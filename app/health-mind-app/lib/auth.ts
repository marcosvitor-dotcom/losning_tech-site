// ─── Health Mind Auth Utilities ───────────────────────────────────────────────
// Gerencia token JWT no localStorage do browser (client-side only)

const TOKEN_KEY = 'hm_token'
const USER_KEY = 'hm_user'

export interface HMUser {
  _id: string
  name: string
  email: string
  role: 'psychologist' | 'clinic' | 'patient' | 'admin'
  profileImage?: string
}

export function saveSession(token: string, user: HMUser) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): HMUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// Chama a API de login e retorna { token, user }
export async function apiLogin(email: string, password: string): Promise<{ token: string; user: HMUser }> {
  const base = process.env.NEXT_PUBLIC_HEALTH_MIND_API_URL || ''
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    const err: any = new Error(data.message || 'Erro ao fazer login')
    err.errorCode = data.errorCode || 'UNKNOWN'
    throw err
  }
  return { token: data.data.token, user: data.data.user }
}

// Busca os tickets de suporte do usuário autenticado
export async function apiGetMyTickets() {
  const base = process.env.NEXT_PUBLIC_HEALTH_MIND_API_URL || ''
  const token = getToken()
  const res = await fetch(`${base}/api/support`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erro ao buscar tickets')
  return data.data as SupportTicket[]
}

// Cria um ticket de suporte
export async function apiCreateTicket(subject: string, message: string) {
  const base = process.env.NEXT_PUBLIC_HEALTH_MIND_API_URL || ''
  const token = getToken()
  const res = await fetch(`${base}/api/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subject, message }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Erro ao criar ticket')
  return data.data
}

export interface SupportTicket {
  _id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  responses: Array<{ message: string; createdAt: string }>
}
