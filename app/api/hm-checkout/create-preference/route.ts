import { NextRequest, NextResponse } from "next/server"
import MercadoPago, { Preference } from "mercadopago"

// ─── Planos disponíveis (espelho do subscriptionPlans.js da API) ──────────────
const PLANS: Record<string, { name: string; monthlyAmount: number; setupFee: number; description: string; type: "psychologist" | "clinic" }> = {
  psico_consciencia: { name: "Consciência",  monthlyAmount: 300,  setupFee: 0,   description: "Até 5 pacientes",    type: "psychologist" },
  psico_equilibrio:  { name: "Equilíbrio",   monthlyAmount: 500,  setupFee: 150, description: "Até 10 pacientes",   type: "psychologist" },
  psico_plenitude:   { name: "Plenitude",    monthlyAmount: 700,  setupFee: 150, description: "Até 15 pacientes",   type: "psychologist" },
  clinic_essencia:   { name: "Essência",     monthlyAmount: 800,  setupFee: 350, description: "3 psicólogos, 15 pacientes", type: "clinic" },
  clinic_amplitude:  { name: "Amplitude",    monthlyAmount: 1200, setupFee: 350, description: "5 psicólogos, 25 pacientes", type: "clinic" },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // A senha NÃO é mais recebida aqui — o usuário define a senha após o pagamento
    // via e-mail de definição de senha enviado automaticamente pelo webhook
    const { planKey, name, email, cnpj, crp, phone } = body

    if (!planKey || !name || !email) {
      return NextResponse.json({ success: false, message: "Campos obrigatórios: planKey, name, email" }, { status: 400 })
    }

    const plan = PLANS[planKey]
    if (!plan) {
      return NextResponse.json({ success: false, message: "Plano inválido" }, { status: 400 })
    }

    const mp = new MercadoPago({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
    const preference = new Preference(mp)

    // Total = setup fee (se houver) + 1ª mensalidade
    const setupFee = plan.setupFee > 0 ? plan.setupFee : 0
    const total = setupFee + plan.monthlyAmount

    const items: any[] = [
      {
        id: `${planKey}_monthly`,
        title: `Health Mind — Plano ${plan.name} (1ª mensalidade)`,
        description: plan.description,
        quantity: 1,
        unit_price: plan.monthlyAmount,
        currency_id: "BRL",
      },
    ]

    if (setupFee > 0) {
      items.unshift({
        id: `${planKey}_setup`,
        title: `Health Mind — Taxa de adesão (Plano ${plan.name})`,
        description: "Cobrada uma única vez na ativação",
        quantity: 1,
        unit_price: setupFee,
        currency_id: "BRL",
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://losningtech.com.br"

    const prefResult = await preference.create({
      body: {
        items,
        payer: { name, email },
        back_urls: {
          success: `${baseUrl}/health-mind-app/checkout/sucesso`,
          failure: `${baseUrl}/health-mind-app/checkout/falha`,
          pending: `${baseUrl}/health-mind-app/checkout/pendente`,
        },
        auto_return: "approved",
        // Metadata sem senha — o webhook criará a conta com senha temporária
        // e disparará o e-mail de definição de senha para o usuário
        metadata: {
          planKey,
          subscriberType: plan.type,
          name,
          email,
          cnpj:  cnpj  || null,
          crp:   crp   || null,
          phone: phone || null,
        },
        notification_url: `${baseUrl}/api/hm-checkout/webhook`,
        statement_descriptor: "HEALTHMIND",
        payment_methods: {
          excluded_payment_types: [],
          installments: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      preferenceId: prefResult.id,
      initPoint: prefResult.init_point,
      sandboxInitPoint: prefResult.sandbox_init_point,
      total,
    })
  } catch (err: any) {
    console.error("[hm-checkout] create-preference error:", err)
    return NextResponse.json({ success: false, message: err.message || "Erro interno" }, { status: 500 })
  }
}
