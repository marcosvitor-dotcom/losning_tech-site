import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Lead from "@/lib/models/Lead"
import { sendLeadNotification } from "@/lib/mailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, message, interest, website } = body

    // Honeypot anti-bot: campo oculto preenchido => descarta silenciosamente.
    if (website) {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nome, e-mail e mensagem são obrigatórios." },
        { status: 400 }
      )
    }

    await connectDB()

    const lead = await Lead.create({
      name,
      email,
      phone: phone || "",
      company: company || "",
      interest: interest || "geral",
      message,
      source: "site",
      status: "new",
    })

    // Notifica o comercial por e-mail. Falha aqui não invalida o lead já salvo.
    try {
      await sendLeadNotification({ name, email, phone, company, interest, message })
    } catch (mailError) {
      console.error("Lead salvo, mas falha ao enviar e-mail de notificação:", mailError)
    }

    return NextResponse.json({ success: true, id: lead._id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao salvar lead:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar sua solicitação." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    await connectDB()
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ leads })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar leads." }, { status: 500 })
  }
}
