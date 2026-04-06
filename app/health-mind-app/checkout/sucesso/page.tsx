"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function SucessoContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!paymentId) { setChecked(true); return }
    fetch(`/api/hm-checkout/status/${paymentId}`)
      .then(r => r.json())
      .then(() => setChecked(true))
      .catch(() => setChecked(true))
  }, [paymentId])

  return (
    <div style={{ minHeight: "100vh", background: "#F4F0F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #2A9D8F, #1B7A6E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={36} height={36} style={{ borderRadius: 9 }} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2D2435", marginBottom: 10 }}>
          Pagamento confirmado!
        </h1>
        <p style={{ fontSize: 15, color: "#8C7F99", lineHeight: 1.6, marginBottom: 28 }}>
          Sua assinatura do <strong>Health Mind</strong> está ativa. Sua conta foi criada automaticamente e você já pode fazer login.
        </p>

        {paymentId && (
          <div style={{ background: "#F4F0F8", borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 12, color: "#8C7F99" }}>
            ID do pagamento: <strong style={{ color: "#2D2435" }}>{paymentId}</strong>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/health-mind-app/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", borderRadius: 12, background: "linear-gradient(135deg, #C2748F, #9B8EC4)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Fazer login agora
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </Link>
          <Link href="/health-mind-app" style={{ padding: "12px", borderRadius: 12, border: "1px solid #EDE8F2", color: "#8C7F99", fontSize: 13, textDecoration: "none" }}>
            Voltar ao site
          </Link>
        </div>

        <p style={{ fontSize: 11, color: "#BDBDBD", marginTop: 24 }}>
          Não recebeu e-mail de confirmação? Entre em contato com{" "}
          <a href="mailto:contato@losningtech.com.br" style={{ color: "#C2748F" }}>contato@losningtech.com.br</a>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  )
}
