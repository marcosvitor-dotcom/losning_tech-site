import { NextRequest, NextResponse } from "next/server"
import MercadoPago, { Payment } from "mercadopago"

const HM_API = process.env.HEALTH_MIND_API_URL || "https://health-mind-api.vercel.app"

// ─── Gera senha temporária aleatória segura ───────────────────────────────────
// A senha temporária atende aos requisitos mínimos da API (8+ chars, maiúscula, número, especial)
// O usuário vai redefini-la via e-mail de "definir senha" enviado logo após a criação da conta
function generateTempPassword(): string {
  const upper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower   = "abcdefghijklmnopqrstuvwxyz"
  const digits  = "0123456789"
  const special = "!@#$%"
  const all     = upper + lower + digits + special
  const rand    = () => Math.floor(Math.random() * all.length)
  // Garante ao menos 1 de cada categoria exigida
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
    ...Array.from({ length: 9 }, () => all[rand()]),
  ]
  // Embaralha para não ter padrão fixo
  return chars.sort(() => Math.random() - 0.5).join("")
}

// ─── Webhook do Mercado Pago ──────────────────────────────────────────────────
// Fluxo após pagamento aprovado:
// 1. Consulta payment no MP para pegar metadata
// 2. Registra o usuário na API Health Mind com senha temporária
// 3. Cria a assinatura via API Health Mind (usando HM_ADMIN_TOKEN)
// 4. Dispara forgot-password para o usuário definir a própria senha
//    (o usuário recebe e-mail: "Sua conta foi criada, clique aqui para definir sua senha")

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envia: { action: "payment.created"|"payment.updated", data: { id } }
    // ou formato antigo: { topic: "payment", resource: ".../{id}" }
    let paymentId: string | null = null

    if (body?.data?.id) {
      paymentId = String(body.data.id)
    } else if (body?.resource) {
      const parts = String(body.resource).split("/")
      paymentId = parts[parts.length - 1]
    }

    // Confirma que é notificação de pagamento
    if (!paymentId || (body?.type && body.type !== "payment")) {
      return NextResponse.json({ received: true })
    }

    const mp = new MercadoPago({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: paymentId })

    // Só processa pagamentos aprovados
    if (payment.status !== "approved") {
      return NextResponse.json({ received: true, status: payment.status })
    }

    const meta = payment.metadata as any
    if (!meta?.email || !meta?.plan_key) {
      console.error("[webhook] metadata incompleta:", meta)
      return NextResponse.json({ received: true, warning: "metadata incompleta" })
    }

    // Normaliza chaves (MP converte camelCase → snake_case na metadata)
    const planKey        = meta.plan_key        || meta.planKey
    const subscriberType = meta.subscriber_type || meta.subscriberType  // "psychologist" | "clinic"
    const name           = meta.name
    const email          = meta.email
    const cnpj           = meta.cnpj   || null
    const crp            = meta.crp    || null
    const phone          = meta.phone  || null

    // ── 1. Registra o usuário na API Health Mind ──────────────────────────────
    // Usa senha temporária — o usuário vai redefini-la via e-mail enviado no passo 3
    const tempPassword = generateTempPassword()

    let registerBody: Record<string, any>
    let registerEndpoint: string

    if (subscriberType === "clinic") {
      registerEndpoint = `${HM_API}/api/auth/register/clinic`
      registerBody = { name, email, password: tempPassword, phone, cnpj }
    } else {
      registerEndpoint = `${HM_API}/api/auth/register/psychologist`
      // clinicId omitido — psicólogo independente (sem clínica vinculada)
      registerBody = { name, email, password: tempPassword, phone, crp }
    }

    const registerRes = await fetch(registerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerBody),
    })
    const registerData = await registerRes.json()

    if (!registerRes.ok && !registerData?.data?.user) {
      // Se o email já existe pode ser re-tentativa do webhook — continua para garantir a assinatura
      if (registerData?.message?.toLowerCase().includes("já existe") || registerData?.message?.toLowerCase().includes("already")) {
        console.warn("[webhook] Usuário já existe, pulando criação:", email)
      } else {
        console.error("[webhook] Falha ao criar usuário:", registerData)
        return NextResponse.json({ received: true, error: "register_failed", detail: registerData?.message }, { status: 200 })
      }
    }

    const userId = registerData?.data?.user?._id
    if (!userId) {
      console.warn("[webhook] Não foi possível obter userId:", registerData)
      return NextResponse.json({ received: true, warning: "no_user_id" })
    }

    // ── 2. Cria a assinatura via API Health Mind ──────────────────────────────
    const subscriberModel = subscriberType === "clinic" ? "Clinic" : "Psychologist"

    const subRes = await fetch(`${HM_API}/api/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HM_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        subscriberId: userId,
        subscriberModel,
        planKey,
        notes: `Pagamento automático via Mercado Pago — Payment ID: ${paymentId}`,
      }),
    })
    const subData = await subRes.json()

    if (!subRes.ok) {
      console.error("[webhook] Falha ao criar assinatura:", subData)
      // Não bloqueia — retorna sucesso para o MP não re-enviar o webhook
    }

    // ── 3. Dispara e-mail para o usuário definir a própria senha ──────────────
    // O forgot-password da API envia um e-mail com link/deep-link para redefinição
    try {
      await fetch(`${HM_API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    } catch (fpErr) {
      // Não crítico — o admin pode reenviar manualmente se necessário
      console.warn("[webhook] Falha ao disparar forgot-password:", fpErr)
    }

    console.info(`[webhook] ✅ Conta criada, assinatura ativada e e-mail de senha enviado: ${email} (${planKey}) | MP Payment: ${paymentId}`)
    return NextResponse.json({ received: true, success: true, userId, planKey })
  } catch (err: any) {
    console.error("[webhook] erro interno:", err)
    // Retorna 200 para o MP não reenviar indefinidamente
    return NextResponse.json({ received: true, error: err.message }, { status: 200 })
  }
}

// MP também envia GET para validar a URL
export async function GET() {
  return NextResponse.json({ ok: true })
}
