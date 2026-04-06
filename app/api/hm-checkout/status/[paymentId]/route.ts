import { NextRequest, NextResponse } from "next/server"
import MercadoPago, { Payment } from "mercadopago"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params
    const mp = new MercadoPago({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: paymentId })

    return NextResponse.json({
      success: true,
      status: payment.status,           // "approved" | "pending" | "rejected" | "cancelled"
      statusDetail: payment.status_detail,
      paymentMethodId: payment.payment_method_id,
      payerEmail: payment.payer?.email,
      amount: payment.transaction_amount,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
