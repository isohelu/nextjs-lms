import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const categories = db.prepare('SELECT id, title, slug, icon, description FROM product_categories ORDER BY sort ASC, id ASC').all()
    return NextResponse.json(categories)
  } catch (err) {
    return NextResponse.json([], { status: 500 })
  }
}
