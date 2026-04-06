"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get("plan") || ""

  return (
    <div style={{ minHeight: "100vh", background: "#F4F0F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF0F0", border: "2px solid #F5C6C6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={36} height={36} style={{ borderRadius: 9 }} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#2D2435", marginBottom: 10 }}>Pagamento não aprovado</h1>
        <p style={{ fontSize: 14, color: "#8C7F99", lineHeight: 1.6, marginBottom: 28 }}>
          Houve um problema ao processar seu pagamento. Nenhum valor foi cobrado. Verifique os dados do cartão e tente novamente.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {planKey && (
            <Link href={`/health-mind-app/checkout/${planKey}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", borderRadius: 12, background: "linear-gradient(135deg, #C2748F, #9B8EC4)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Tentar novamente
            </Link>
          )}
          <Link href="/health-mind-app#planos" style={{ padding: "12px", borderRadius: 12, border: "1px solid #EDE8F2", color: "#8C7F99", fontSize: 13, textDecoration: "none" }}>
            Ver planos
          </Link>
        </div>

        <p style={{ fontSize: 11, color: "#BDBDBD", marginTop: 24 }}>
          Problemas persistentes?{" "}
          <a href="mailto:contato@losningtech.com.br" style={{ color: "#C2748F" }}>contato@losningtech.com.br</a>
        </p>
      </div>
    </div>
  )
}
