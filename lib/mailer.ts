import nodemailer from "nodemailer"
import { company } from "@/lib/data/company"

export interface LeadEmailData {
  name: string
  email: string
  phone?: string
  company?: string
  interest?: string
  message: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST || "smtp.gmail.com"
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error("SMTP_USER e SMTP_PASS não configurados no ambiente.")
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL; 587 = STARTTLS
    auth: { user, pass },
  })

  return transporter
}

const interestLabels: Record<string, string> = {
  "bi-dados": "BI & Engenharia de Dados",
  "health-mind": "Health Mind",
  geral: "Geral",
}

/**
 * Envia um e-mail de notificação para o comercial avisando de um novo lead.
 * Lança erro em caso de falha — quem chama decide se ignora (o lead já foi salvo).
 */
export async function sendLeadNotification(lead: LeadEmailData) {
  const to = process.env.LEAD_NOTIFICATION_TO || company.email
  const from = process.env.SMTP_USER as string
  const interest = interestLabels[lead.interest || "geral"] || lead.interest || "Geral"

  const rows: Array<[string, string]> = [
    ["Nome", lead.name],
    ["E-mail", lead.email],
    ["Telefone / WhatsApp", lead.phone || "—"],
    ["Empresa", lead.company || "—"],
    ["Interesse", interest],
  ]

  const text = [
    "Novo lead recebido pelo site da Losning Tech.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Mensagem:",
    lead.message,
    "",
    "— Enviado automaticamente pelo site losningtech.com.br",
  ].join("\n")

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#14252b">
      <div style="background:linear-gradient(135deg,#0f2a33,#1e7f76);padding:24px;border-radius:14px 14px 0 0">
        <h2 style="margin:0;color:#fff;font-size:18px">Novo lead pelo site</h2>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:13px">Losning Tech · losningtech.com.br</p>
      </div>
      <div style="border:1px solid #d6ecea;border-top:0;border-radius:0 0 14px 14px;padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([k, v]) =>
                `<tr>
                  <td style="padding:8px 0;color:#5e7780;width:160px;vertical-align:top">${k}</td>
                  <td style="padding:8px 0;font-weight:600">${escapeHtml(v)}</td>
                </tr>`
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#eaf6f4;border-radius:10px">
          <p style="margin:0 0 6px;color:#5e7780;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Mensagem</p>
          <p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message)}</p>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#5e7780">
          Responda este e-mail para falar direto com o lead (${escapeHtml(lead.email)}).
        </p>
      </div>
    </div>
  `

  await getTransporter().sendMail({
    from: `"Losning Tech — Site" <${from}>`,
    to,
    replyTo: lead.email,
    subject: `Novo lead pelo site: ${lead.name}`,
    text,
    html,
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
