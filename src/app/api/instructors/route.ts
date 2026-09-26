import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const instructors = db.prepare(`
      SELECT i.id, i.user_id, u.name, u.email, u.photo
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      WHERE i.status = 'approved' OR i.status = 'active' OR i.status = 1
      ORDER BY i.id ASC
    `).all() as Array<{
      id: number
      user_id: number
      name: string
      email: string
      photo: string | null
    }>

    const formatted = instructors.map((inst) => ({
      id: inst.id,
      user_id: inst.user_id,
      name: inst.name,
      label: inst.name,
      value: String(inst.id),
      email: inst.email,
      photo: inst.photo,
    }))

    return NextResponse.json(formatted)
  } catch (err: unknown) {
    console.error('Error fetching instructors:', err)
    return NextResponse.json([], { status: 500 })
  }
}
