import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Lead from "@/lib/models/Lead"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const body = await request.json()
    await connectDB()

    const lead = await Lead.findByIdAndUpdate(
      params.id,
      { status: body.status },
      { new: true }
    )

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 })
    }

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar lead." }, { status: 500 })
  }
}
