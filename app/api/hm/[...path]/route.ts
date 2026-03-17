import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.HEALTH_MIND_API_URL || "https://health-mind-api.vercel.app"

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const url = new URL(req.url)
  const targetUrl = `${API_BASE}/api/${path}${url.search}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const auth = req.headers.get("authorization")
  if (auth) headers["Authorization"] = auth

  let body: string | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    try { body = await req.text() } catch { /* empty body */ }
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx)
}
