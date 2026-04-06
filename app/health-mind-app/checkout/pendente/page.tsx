"use client"

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function PendenteContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("payment_id")

  return (
    <div style={{ minHeight: "100vh", background: "#F4F0F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF4E6", border: "2px solid #FFD180", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Image src="/health-mind-app/images/favicon.png" alt="Health Mind" width={36} height={36} style={{ borderRadius: 9 }} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#2D2435", marginBottom: 10 }}>Pagamento pendente</h1>
        <p style={{ fontSize: 14, color: "#8C7F99", lineHeight: 1.6, marginBottom: 20 }}>
          Seu pagamento está sendo processado. Se escolheu <strong>PIX ou boleto</strong>, aguarde a confirmação — sua conta será criada automaticamente assim que o pagamento for aprovado.
        </p>

        {paymentId && (
          <div style={{ background: "#FFF4E6", borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 12, color: "#8C7F99" }}>
            ID do pagamento: <strong style={{ color: "#2D2435" }}>{paymentId}</strong>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/health-mind-app" style={{ padding: "12px", borderRadius: 12, border: "1px solid #EDE8F2", color: "#8C7F99", fontSize: 13, textDecoration: "none" }}>
            Voltar ao site
          </Link>
        </div>

        <p style={{ fontSize: 11, color: "#BDBDBD", marginTop: 24 }}>
          Dúvidas?{" "}
          <a href="mailto:contato@losningtech.com.br" style={{ color: "#C2748F" }}>contato@losningtech.com.br</a>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <PendenteContent />
    </Suspense>
  )
}
