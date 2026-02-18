"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Mail, Phone, Building2, MessageSquare, LogOut,
  RefreshCw, User, Calendar, TrendingUp, Users, Inbox
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Lead {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  status: "new" | "contacted" | "qualified" | "closed"
  createdAt: string
}

const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  closed: "Fechado",
}

const STATUS_COLORS: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Lead["status"] | "all">("all")

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token")
    const u = sessionStorage.getItem("admin_user")
    if (!t) {
      router.push("/admin")
      return
    }
    setToken(t)
    if (u) setUser(JSON.parse(u))
  }, [router])

  const fetchLeads = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setLeads(data.leads || [])
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token")
    sessionStorage.removeItem("admin_user")
    router.push("/admin")
  }

  const updateStatus = async (id: string, status: Lead["status"]) => {
    if (!token) return
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)))
        if (selected?._id === id) setSelected((prev) => prev ? { ...prev, status } : null)
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter)
  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    closed: leads.filter((l) => l.status === "closed").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#0a1628] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png"
            alt="Losning Tech"
            width={110}
            height={36}
            className="h-7 w-auto brightness-0 invert"
          />
          <span className="text-white/40 text-lg select-none">|</span>
          <span className="text-sm font-medium text-white/80">CRM</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
            <User className="w-4 h-4" />
            <span>{user?.name || user?.email || "Admin"}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchLeads}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total de Leads", value: counts.all, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Novos", value: counts.new, icon: Inbox, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Contatados", value: counts.contacted, icon: MessageSquare, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Qualificados", value: counts.qualified, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`${s.bg} p-2.5 rounded-lg`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["all", "new", "contacted", "qualified", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                filter === f
                  ? "bg-[#0a1628] text-white border-[#0a1628]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f === "all" ? "Todos" : STATUS_LABELS[f]}
              <span className="ml-1.5 text-xs opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Layout split */}
        <div className="flex gap-4 h-[calc(100vh-300px)] min-h-[400px]">
          {/* Lista */}
          <div className="w-full md:w-2/5 lg:w-1/3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Inbox className="w-8 h-8 mb-2 opacity-40" />
                  <span className="text-sm">Nenhum lead encontrado</span>
                </div>
              ) : (
                filtered.map((lead) => (
                  <button
                    key={lead._id}
                    onClick={() => setSelected(lead)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selected?._id === lead._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm truncate">{lead.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                    {lead.company && (
                      <p className="text-xs text-gray-400 truncate">{lead.company}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detalhe */}
          <div className="hidden md:flex flex-col flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {selected ? (
              <>
                {/* Header do detalhe */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selected.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[selected.status]}`}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {/* Contato */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contato</h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">
                          {selected.email}
                        </a>
                      </div>
                      {selected.phone && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`tel:${selected.phone}`} className="text-blue-600 hover:underline">
                            {selected.phone}
                          </a>
                        </div>
                      )}
                      {selected.company && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-gray-700">{selected.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mensagem</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                      {selected.message}
                    </div>
                  </div>

                  {/* Ações rápidas */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações Rápidas</h3>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`mailto:${selected.email}`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Enviar E-mail
                        </Button>
                      </a>
                      {selected.phone && (
                        <a href={`https://wa.me/55${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50">
                            <Phone className="w-3.5 h-3.5" />
                            WhatsApp
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Alterar status:</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["new", "contacted", "qualified", "closed"] as const).map((s) => (
                      <button
                        key={s}
                        disabled={selected.status === s || updatingId === selected._id}
                        onClick={() => updateStatus(selected._id, s)}
                        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                          selected.status === s
                            ? STATUS_COLORS[s] + " cursor-default"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {updatingId === selected._id && selected.status !== s ? "..." : STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Selecione um lead para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
