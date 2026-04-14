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
    const { searchParams } = new URL(req.url)
    const qId    = searchParams.get("id")
    const qTopic = searchParams.get("topic")
    const qDataId = searchParams.get("data.id")
    const qType  = searchParams.get("type")

    // Tenta ler body JSON (pode ser vazio em notificações via query param)
    let body: any = {}
    try { body = await req.json() } catch { /* body vazio — ok */ }

    // MP envia: { action: "payment.created"|"payment.updated", data: { id } }
    // ou formato antigo via query param: ?id=xxx&topic=payment
    // ou formato moderno via query param: ?data.id=xxx&type=payment
    let paymentId: string | null = null
    let topicOrType: string | null = null

    if (body?.data?.id) {
      paymentId   = String(body.data.id)
      topicOrType = body.type || null
    } else if (body?.resource) {
      const parts = String(body.resource).split("/")
      paymentId   = parts[parts.length - 1]
      topicOrType = body.topic || null
    } else if (qDataId) {
      // Formato moderno via query param: ?data.id=xxx&type=payment
      paymentId   = qDataId
      topicOrType = qType
    } else if (qId) {
      // Formato legado via query param: ?id=xxx&topic=payment
      paymentId   = qId
      topicOrType = qTopic
    }

    // Confirma que é notificação de pagamento
    if (!paymentId || (topicOrType && topicOrType !== "payment")) {
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

    let userId = registerData?.data?.user?._id

    if (!registerRes.ok && !userId) {
      const msg = registerData?.message?.toLowerCase() || ""
      const alreadyExists = msg.includes("já existe") || msg.includes("already") || msg.includes("já cadastrado") || msg.includes("already registered")

      if (alreadyExists) {
        // Re-tentativa do webhook — usuário já existe, faz login para obter o userId
        console.warn("[webhook] Usuário já existe, obtendo userId via login:", email)
        const loginEndpoint = subscriberType === "clinic"
          ? `${HM_API}/api/auth/login/clinic`
          : `${HM_API}/api/auth/login/psychologist`
        const loginRes = await fetch(loginEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: tempPassword }),
        })
        const loginData = await loginRes.json()
        userId = loginData?.data?.user?._id
        if (!userId) {
          // Senha temporária diferente (re-tentativa com senha anterior) — apenas loga e segue
          console.warn("[webhook] Login falhou (senha diferente em re-tentativa), assinatura pode já existir:", email)
          return NextResponse.json({ received: true, warning: "existing_user_login_failed" })
        }
      } else {
        console.error("[webhook] Falha ao criar usuário:", registerData)
        return NextResponse.json({ received: true, error: "register_failed", detail: registerData?.message }, { status: 200 })
      }
    }

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
