/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Health Mind App — Script de Testes de Pagamento (Mercado Pago Sandbox)
 * ─────────────────────────────────────────────────────────────────────────────
 * Uso:
 *   node scripts/test-payment.mjs
 *   node scripts/test-payment.mjs --plan psico_consciencia
 *   node scripts/test-payment.mjs --plan clinic_essencia
 *   node scripts/test-payment.mjs --webhook <paymentId>
 *   node scripts/test-payment.mjs --status <paymentId>
 *
 * Pré-requisitos:
 *   - Servidor Next.js rodando (npm run dev ou ngrok apontando para localhost:3000)
 *   - NEXT_PUBLIC_BASE_URL configurado no .env.local
 *   - Credenciais de teste do Mercado Pago no .env.local
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Carrega variáveis do .env.local ──────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local")
  const content = readFileSync(envPath, "utf-8")
  const env = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const [key, ...rest] = trimmed.split("=")
    env[key.trim()] = rest.join("=").trim()
  }
  return env
}

const ENV = loadEnv()
// Permite sobrescrever a URL via argumento --url ou usar localhost como fallback
const urlArg = (() => { const i = process.argv.indexOf("--url"); return i !== -1 ? process.argv[i + 1] : null })()
const BASE_URL = urlArg || "http://localhost:3000"

// ── Cartões de teste do Mercado Pago ─────────────────────────────────────────
const TEST_CARDS = {
  mastercard:  { number: "5031 4332 1540 6351", cvv: "123", expiry: "11/30", brand: "Mastercard" },
  visa:        { number: "4235 6477 2802 5682", cvv: "123", expiry: "11/30", brand: "Visa" },
  amex:        { number: "3753 651535 56885",   cvv: "1234", expiry: "11/30", brand: "American Express" },
  elo_debit:   { number: "5067 7667 8388 8311", cvv: "123", expiry: "11/30", brand: "Elo Débito" },
}

// ── Titulares de cartão por status desejado ───────────────────────────────────
const CARD_HOLDERS = {
  approved:        { name: "APRO",  doc: "12345678909", status: "✅ Pagamento aprovado" },
  rejected_other:  { name: "OTHE",  doc: "12345678909", status: "❌ Recusado por erro geral" },
  pending:         { name: "CONT",  doc: "",             status: "⏳ Pagamento pendente" },
  rejected_call:   { name: "CALL",  doc: "",             status: "❌ Requer autorização (ligar)"},
  rejected_funds:  { name: "FUND",  doc: "",             status: "❌ Saldo insuficiente" },
  rejected_cvv:    { name: "SECU",  doc: "",             status: "❌ CVV inválido" },
  rejected_expiry: { name: "EXPI",  doc: "",             status: "❌ Data de vencimento inválida" },
  rejected_form:   { name: "FORM",  doc: "",             status: "❌ Erro no formulário" },
}

// ── Planos disponíveis ────────────────────────────────────────────────────────
const PLANS = {
  psico_consciencia: { name: "Consciência",  monthly: 300,  setup: 0,   type: "psychologist" },
  psico_equilibrio:  { name: "Equilíbrio",   monthly: 500,  setup: 150, type: "psychologist" },
  psico_plenitude:   { name: "Plenitude",    monthly: 700,  setup: 150, type: "psychologist" },
  clinic_essencia:   { name: "Essência",     monthly: 800,  setup: 350, type: "clinic" },
  clinic_amplitude:  { name: "Amplitude",    monthly: 1200, setup: 350, type: "clinic" },
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function log(msg, color = "\x1b[0m") {
  console.log(`${color}${msg}\x1b[0m`)
}

function section(title) {
  console.log("\n\x1b[36m" + "═".repeat(60) + "\x1b[0m")
  console.log("\x1b[36m  " + title + "\x1b[0m")
  console.log("\x1b[36m" + "─".repeat(60) + "\x1b[0m")
}

function ok(label, value = "") {
  console.log(`  \x1b[32m✓\x1b[0m ${label}${value ? ": \x1b[33m" + value + "\x1b[0m" : ""}`)
}

function fail(label, detail = "") {
  console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ": " + detail : ""}`)
}

function warn(label, detail = "") {
  console.log(`  \x1b[33m⚠\x1b[0m ${label}${detail ? ": " + detail : ""}`)
}

async function apiCall(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  return { status: res.status, ok: res.ok, json }
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 1 — Criação de preferência (todos os planos)
// ─────────────────────────────────────────────────────────────────────────────

async function testCreatePreference(planKey) {
  const plan = PLANS[planKey]
  const isPsico = plan.type === "psychologist"

  const payload = {
    planKey,
    name: "Teste Automático",
    email: `teste.${planKey.replace(/_/g, ".")}@healthmind.com.br`,
    ...(isPsico ? { crp: "12345/SP" } : { cnpj: "12.345.678/0001-99" }),
    phone: "(11) 99999-9999",
  }

  const { status, ok: isOk, json } = await apiCall("/api/hm-checkout/create-preference", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (isOk && json.success) {
    ok(`Plano ${plan.name} (${planKey})`, `R$${plan.monthly + plan.setup} | ID: ${json.preferenceId?.slice(0, 20)}...`)
    ok(`  Sandbox URL`, json.sandboxInitPoint ? "disponível ✓" : "ausente ✗")
    return { success: true, preferenceId: json.preferenceId, sandboxInitPoint: json.sandboxInitPoint }
  } else {
    fail(`Plano ${plan.name}`, `HTTP ${status} — ${json.message || JSON.stringify(json)}`)
    return { success: false }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 2 — Validação de campos obrigatórios
// ─────────────────────────────────────────────────────────────────────────────

async function testValidation() {
  section("TESTE 2 — Validação de campos obrigatórios")

  const cases = [
    { label: "Sem planKey",  body: { name: "A", email: "a@b.com" } },
    { label: "Sem name",     body: { planKey: "psico_consciencia", email: "a@b.com" } },
    { label: "Sem email",    body: { planKey: "psico_consciencia", name: "A" } },
    { label: "Plano inválido", body: { planKey: "plano_inexistente", name: "A", email: "a@b.com" } },
    { label: "Body vazio",   body: {} },
  ]

  for (const { label, body } of cases) {
    const { status, json } = await apiCall("/api/hm-checkout/create-preference", {
      method: "POST",
      body: JSON.stringify(body),
    })
    if (status === 400) {
      ok(label, `400 — "${json.message}"`)
    } else {
      fail(label, `esperado 400, obteve ${status}`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 3 — Consulta de status de pagamento
// ─────────────────────────────────────────────────────────────────────────────

async function testPaymentStatus(paymentId) {
  section(`TESTE 3 — Status do pagamento ${paymentId}`)

  const { status, json } = await apiCall(`/api/hm-checkout/status/${paymentId}`)
  if (json.success) {
    ok("Status consultado", json.status)
    ok("Detalhe", json.statusDetail || "(sem detalhe)")
    ok("Método", json.paymentMethodId || "(sem método)")
    ok("E-mail do pagador", json.payerEmail || "(sem e-mail)")
    ok("Valor", json.amount ? `R$${json.amount}` : "(sem valor)")
  } else {
    fail("Consulta falhou", `HTTP ${status} — ${json.message}`)
  }
  return json
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 4 — Webhook (simula notificação do Mercado Pago)
// ─────────────────────────────────────────────────────────────────────────────

async function testWebhook(paymentId) {
  section(`TESTE 4 — Webhook com Payment ID ${paymentId}`)

  // Formato moderno (v1)
  const payloadV1 = {
    action: "payment.updated",
    api_version: "v1",
    data: { id: paymentId },
    date_created: new Date().toISOString(),
    id: Math.floor(Math.random() * 1e10),
    live_mode: false,
    type: "payment",
    user_id: "3317515294",
  }

  log("  Enviando notificação formato v1 (data.id)...", "\x1b[90m")
  const { status: s1, json: j1 } = await apiCall("/api/hm-checkout/webhook", {
    method: "POST",
    body: JSON.stringify(payloadV1),
  })
  if (s1 === 200 && j1.received) {
    ok("Formato v1 recebido", j1.success ? "✅ conta criada" : j1.warning || j1.error || "recebido sem ação")
  } else {
    fail("Formato v1", `HTTP ${s1}`)
  }

  // Formato legado (resource)
  const payloadLegacy = {
    topic: "payment",
    resource: `https://api.mercadopago.com/v1/payments/${paymentId}`,
  }

  log("  Enviando notificação formato legado (resource)...", "\x1b[90m")
  const { status: s2, json: j2 } = await apiCall("/api/hm-checkout/webhook", {
    method: "POST",
    body: JSON.stringify(payloadLegacy),
  })
  if (s2 === 200 && j2.received) {
    ok("Formato legado recebido", j2.success ? "✅ conta criada" : j2.warning || j2.error || "recebido sem ação")
  } else {
    fail("Formato legado", `HTTP ${s2}`)
  }

  // Evento não-payment (deve ser ignorado graciosamente)
  const payloadOther = { type: "merchant_order", data: { id: "123" } }
  log("  Enviando notificação de tipo não-payment (deve ser ignorada)...", "\x1b[90m")
  const { status: s3, json: j3 } = await apiCall("/api/hm-checkout/webhook", {
    method: "POST",
    body: JSON.stringify(payloadOther),
  })
  if (s3 === 200 && j3.received) {
    ok("Tipo não-payment ignorado graciosamente")
  } else {
    fail("Tipo não-payment", `HTTP ${s3}`)
  }

  // GET deve retornar 200 (validação de URL pelo MP)
  const { status: s4, json: j4 } = await apiCall("/api/hm-checkout/webhook")
  if (s4 === 200 && j4.ok) {
    ok("GET do webhook retorna 200")
  } else {
    fail("GET do webhook", `HTTP ${s4}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTE 5 — Todos os planos (criação de preferência)
// ─────────────────────────────────────────────────────────────────────────────

async function testAllPlans() {
  section("TESTE 1 — Criação de preferência (todos os planos)")

  const results = []
  for (const planKey of Object.keys(PLANS)) {
    const result = await testCreatePreference(planKey)
    results.push({ planKey, ...result })
  }
  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATÓRIO FINAL
// ─────────────────────────────────────────────────────────────────────────────

function printTestCards() {
  section("CARTÕES DE TESTE (use no checkout sandbox)")
  for (const [key, card] of Object.entries(TEST_CARDS)) {
    console.log(`\n  \x1b[33m${card.brand}\x1b[0m`)
    console.log(`    Número:    ${card.number}`)
    console.log(`    CVV:       ${card.cvv}`)
    console.log(`    Validade:  ${card.expiry}`)
  }

  section("TITULARES DE CARTÃO POR CENÁRIO")
  console.log("  Use qualquer número de cartão acima e o nome/CPF abaixo:\n")
  for (const [, holder] of Object.entries(CARD_HOLDERS)) {
    const cpf = holder.doc ? `  CPF: ${holder.doc}` : ""
    console.log(`  ${holder.status}`)
    console.log(`    Nome no cartão: ${holder.name}${cpf}`)
    console.log()
  }
}

function printSandboxInstructions(preferences) {
  section("PRÓXIMOS PASSOS — Teste manual no Sandbox")

  console.log(`
  Para cada link abaixo, acesse no navegador e use os cartões de teste:

  ${preferences.filter(p => p.success && p.sandboxInitPoint).map(p =>
    `• Plano ${PLANS[p.planKey].name} (${p.planKey})\n    ${p.sandboxInitPoint}`
  ).join("\n\n  ")}

  FLUXO COMPLETO:
  1. Acesse um dos links de sandbox acima
  2. Faça login com a conta de COMPRADOR de teste (criada no painel MP Devs)
  3. Preencha o cartão de teste (número + nome APRO + CPF 12345678909)
  4. Confirme o pagamento
  5. Você será redirecionado para /health-mind-app/checkout/sucesso
  6. O webhook /api/hm-checkout/webhook será chamado automaticamente pelo MP
  7. Verifique nos logs do servidor se a conta foi criada na API Health Mind

  WEBHOOK LOCAL (desenvolvimento):
  • Use ngrok: ngrok http 3000
  • Configure NEXT_PUBLIC_BASE_URL no .env.local com a URL do ngrok
  • Configure a URL do webhook no painel MP Devs > Sua aplicação > Webhooks
  • URL de teste: <ngrok-url>/api/hm-checkout/webhook
`)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const flagIndex = (flag) => args.indexOf(flag)
  const flagValue = (flag) => { const i = flagIndex(flag); return i !== -1 ? args[i + 1] : null }

  console.log("\n\x1b[35m╔══════════════════════════════════════════════════════════╗\x1b[0m")
  console.log("\x1b[35m║   Health Mind App — Teste de Pagamento Mercado Pago      ║\x1b[0m")
  console.log("\x1b[35m╚══════════════════════════════════════════════════════════╝\x1b[0m")
  console.log(`\n  Base URL: \x1b[33m${BASE_URL}\x1b[0m`)
  console.log(`  Access Token: \x1b[33m${ENV["MERCADOPAGO_ACCESS_TOKEN"]?.slice(0, 25)}...\x1b[0m`)

  // ── Modo: verificar status de pagamento específico
  if (flagValue("--status")) {
    await testPaymentStatus(flagValue("--status"))
    return
  }

  // ── Modo: disparar webhook com paymentId específico
  if (flagValue("--webhook")) {
    await testWebhook(flagValue("--webhook"))
    return
  }

  // ── Modo: testar plano específico
  if (flagValue("--plan")) {
    const planKey = flagValue("--plan")
    if (!PLANS[planKey]) {
      fail(`Plano "${planKey}" não encontrado.`)
      console.log("  Planos disponíveis: " + Object.keys(PLANS).join(", "))
      return
    }
    section(`Criando preferência para: ${planKey}`)
    const result = await testCreatePreference(planKey)
    if (result.success) {
      console.log(`\n  Acesse o checkout sandbox:\n  \x1b[33m${result.sandboxInitPoint}\x1b[0m\n`)
    }
    return
  }

  // ── Modo padrão: suite completa
  const preferences = await testAllPlans()
  await testValidation()

  printTestCards()
  printSandboxInstructions(preferences)

  section("RESUMO")
  const total = preferences.length
  const passed = preferences.filter(p => p.success).length
  const color = passed === total ? "\x1b[32m" : "\x1b[31m"
  console.log(`\n  ${color}${passed}/${total} planos criaram preferência com sucesso\x1b[0m`)

  if (passed === total) {
    ok("Integração com Mercado Pago está operacional")
  } else {
    fail("Alguns planos falharam — verifique as credenciais e o servidor")
  }

  console.log("\n  Para testar o webhook após um pagamento:")
  console.log("  \x1b[33mnode scripts/test-payment.mjs --webhook <paymentId>\x1b[0m")
  console.log("\n  Para verificar status de um pagamento:")
  console.log("  \x1b[33mnode scripts/test-payment.mjs --status <paymentId>\x1b[0m\n")
}

main().catch((err) => {
  console.error("\x1b[31mErro inesperado:\x1b[0m", err.message)
  process.exit(1)
})
