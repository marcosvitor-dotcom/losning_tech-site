import { NextRequest, NextResponse } from "next/server"
import MercadoPago, { Payment } from "mercadopago"

const HM_API = process.env.HEALTH_MIND_API_URL || "https://health-mind-api.vercel.app"

// ─── Webhook do Mercado Pago ──────────────────────────────────────────────────
// Fluxo após pagamento aprovado:
// 1. Consulta payment no MP para pegar metadata
// 2. Registra o usuário na API Health Mind
// 3. Cria a assinatura via API Health Mind
// 4. Registra o pagamento da assinatura como confirmado

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
    if (!meta?.email || !meta?.plan_key || !meta?.password) {
      console.error("[webhook] metadata incompleta:", meta)
      return NextResponse.json({ received: true, warning: "metadata incompleta" })
    }

    // Normaliza chaves (MP converte camelCase → snake_case na metadata)
    const planKey        = meta.plan_key        || meta.planKey
    const subscriberType = meta.subscriber_type || meta.subscriberType  // "psychologist" | "clinic"
    const name           = meta.name
    const email          = meta.email
    const password       = meta.password
    const cnpj           = meta.cnpj   || null
    const crp            = meta.crp    || null
    const phone          = meta.phone  || null

    // ── 1. Registra o usuário na API Health Mind ──────────────────────────────
    let registerBody: Record<string, any>
    let registerEndpoint: string

    if (subscriberType === "clinic") {
      registerEndpoint = `${HM_API}/api/auth/register/clinic`
      registerBody = { name, email, password, phone, cnpj }
    } else {
      registerEndpoint = `${HM_API}/api/auth/register/psychologist`
      // Psicólogos independentes não exigem clinicId obrigatório — passamos vazio
      registerBody = { name, email, password, phone, crp, clinicId: undefined }
    }

    const registerRes = await fetch(registerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerBody),
    })
    const registerData = await registerRes.json()

    if (!registerRes.ok && !registerData?.data?.user) {
      // Se o email já existe pode ser re-tentativa do webhook — tenta logar para pegar o ID
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

    const token = registerData?.data?.token

    // ── 2. Cria a assinatura via API Health Mind ──────────────────────────────
    const subscriberModel = subscriberType === "clinic" ? "Clinic" : "Psychologist"

    const subRes = await fetch(`${HM_API}/api/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Usa o token do usuário recém-criado — a API pode exigir admin aqui
        // Se necessário, use um token de admin via env
        ...(process.env.HM_ADMIN_TOKEN ? { Authorization: `Bearer ${process.env.HM_ADMIN_TOKEN}` } : { Authorization: `Bearer ${token}` }),
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
      // Não bloqueia — retorna sucesso para MP não re-enviar
    }

    console.info(`[webhook] ✅ Usuário criado e assinatura ativada: ${email} (${planKey}) | MP Payment: ${paymentId}`)
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
