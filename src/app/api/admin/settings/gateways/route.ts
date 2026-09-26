import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { settingRepository } from '@/lib/repositories/settingRepository'

const gatewayUpdateSchema = z.object({
  gateway: z.string().min(1),
  fields: z.record(z.string(), z.unknown())
})

export async function GET() {
  try {
    await requireRole(['admin'])
    const gateways = settingRepository.getPaymentGateways()
    return NextResponse.json({
      success: true,
      gateways
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to retrieve payment gateways.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole(['admin'])
    const body = await req.json()
    const parsed = gatewayUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { gateway, fields } = parsed.data
    const updated = settingRepository.updateByType('payment', gateway, fields)

    return NextResponse.json({
      success: updated,
      message: `${gateway.toUpperCase()} payment gateway settings updated successfully.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update payment gateway settings error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update gateway.' }, { status: 500 })
  }
}
