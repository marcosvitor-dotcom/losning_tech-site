"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Autentica diretamente na API Health Mind
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HEALTH_MIND_API_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Credenciais inválidas.")
        return
      }

      // Verifica se é admin ou clinic
      const role = data.data?.user?.role
      if (role !== "admin" && role !== "clinic") {
        setError("Acesso não autorizado para este perfil.")
        return
      }

      // Salva token no sessionStorage (limpa ao fechar o browser)
      sessionStorage.setItem("admin_token", data.data.token)
      sessionStorage.setItem("admin_user", JSON.stringify(data.data.user))

      router.push("/admin/dashboard")
    } catch (err) {
      setError("Não foi possível conectar à API. Verifique se ela está rodando.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/background_site.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header do card */}
          <div className="bg-gradient-to-br from-[#0a1628] to-[#0f2d5a] px-8 py-10 text-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-losning-preta-ZpmO5mp0uBVZ1TlID2uN3MUZDZeMm3.png"
              alt="Losning Tech"
              width={140}
              height={48}
              className="h-10 w-auto mx-auto brightness-0 invert"
            />
            <p className="text-white/60 text-sm mt-3">Painel Administrativo</p>
          </div>

          {/* Formulário */}
          <div className="px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Entrar</h1>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a1628] hover:bg-[#0f2d5a] text-white mt-2"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Acesso restrito · Losning Tech
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
