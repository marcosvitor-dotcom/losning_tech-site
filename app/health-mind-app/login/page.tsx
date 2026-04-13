"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiLogin, saveSession, getUser } from "../lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Se já estiver logado, redireciona
  useEffect(() => {
    const user = getUser()
    if (user) {
      if (user.role === "psychologist") router.replace("/health-mind-app/dashboard/psicologo")
      else if (user.role === "clinic") router.replace("/health-mind-app/dashboard/clinica")
      else if (user.role === "admin") router.replace("/health-mind-app/dashboard/admin")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setPasswordError("")

    if (!email.trim()) { setEmailError("Digite seu e-mail"); return }
    if (!password) { setPasswordError("Digite sua senha"); return }

    setLoading(true)
    try {
      const { token, user } = await apiLogin(email.trim(), password)
      saveSession(token, user)

      if (user.role === "psychologist") router.push("/health-mind-app/dashboard/psicologo")
      else if (user.role === "clinic") router.push("/health-mind-app/dashboard/clinica")
      else if (user.role === "admin") router.push("/health-mind-app/dashboard/admin")
      else {
        setEmailError("Acesso restrito a psicólogos, clínicas e administradores.")
      }
    } catch (error: any) {
      const code = error.errorCode || ""
      if (code === "EMAIL_NOT_FOUND") setEmailError("E-mail não cadastrado")
      else if (code === "WRONG_PASSWORD") setPasswordError("Senha incorreta")
      else if (code === "ACCOUNT_DELETED") setEmailError("Conta desativada. Entre em contato com o suporte.")
      else setEmailError(error.message || "Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#1A252F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>
      {/* Logo + título */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Image
          src="/health-mind-app/images/favicon.png"
          alt="Health Mind"
          width={100}
          height={100}
          style={{ borderRadius: 20, margin: "0 auto 16px" }}
        />
        <h1 style={{
          color: "#fff",
          fontSize: 26,
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontWeight: 700,
          marginBottom: 6,
        }}>
          Health Mind
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
          Plataforma de Saúde Mental
        </p>
      </div>

      {/* Card de login */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h2 style={{ color: "#2D2435", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          Acessar plataforma
        </h2>
        <p style={{ color: "#8C7F99", fontSize: 13, marginBottom: 24 }}>
          Área exclusiva para psicólogos, clínicas e administradores
        </p>

        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#3D3347", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError("") }}
              placeholder="seu@email.com"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${emailError ? "#E53935" : "#EDE8F2"}`,
                fontSize: 15,
                color: "#2D2435",
                backgroundColor: "#FAFAFA",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => { if (!emailError) e.target.style.borderColor = "#C2748F" }}
              onBlur={e => { if (!emailError) e.target.style.borderColor = "#EDE8F2" }}
            />
            {emailError && (
              <p style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}>{emailError}</p>
            )}
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#3D3347", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError("") }}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 46px 12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${passwordError ? "#E53935" : "#EDE8F2"}`,
                  fontSize: 15,
                  color: "#2D2435",
                  backgroundColor: "#FAFAFA",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { if (!passwordError) e.target.style.borderColor = "#C2748F" }}
                onBlur={e => { if (!passwordError) e.target.style.borderColor = "#EDE8F2" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8C7F99",
                  padding: 4,
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}>{passwordError}</p>
            )}
          </div>

          {/* Botão entrar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#9B8EC4" : "linear-gradient(135deg, #C2748F 0%, #9B8EC4 100%)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 18,
                  height: 18,
                  border: "2.5px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "hm-spin 0.7s linear infinite",
                }} />
                Entrando...
              </>
            ) : "Entrar"}
          </button>
        </form>

        {/* Link esqueci senha */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a
            href="https://www.healthmindapp.com.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#C2748F", fontSize: 13, textDecoration: "none" }}
          >
            Esqueceu a senha? Use o aplicativo móvel
          </a>
        </div>
      </div>

      {/* Links de rodapé */}
      <div style={{ marginTop: 28, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { href: "/health-mind-app/privacy", label: "Privacidade" },
          { href: "/health-mind-app/suporte", label: "Suporte" },
          { href: "/health-mind-app/copyright", label: "Direitos Autorais" },
          { href: "/health-mind-app", label: "← Voltar ao site" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textDecoration: "none" }}
          >
            {label}
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes hm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
