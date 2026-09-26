import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const categories = db.prepare(`
      SELECT id, title, slug, icon, description 
      FROM course_categories 
      ORDER BY sort ASC, id ASC
    `).all() as Array<{
      id: number
      title: string
      slug: string
      icon?: string | null
      description?: string | null
      category_children?: any[]
    }>

    let children: Array<{
      id: number
      title: string
      slug: string
      course_category_id: number
    }> = []

    try {
      children = db.prepare(`
        SELECT id, title, slug, course_category_id 
        FROM course_category_children 
        ORDER BY sort ASC, id ASC
      `).all() as any[]
    } catch {}

    const childMap = new Map<number, any[]>()
    for (const child of children) {
      if (!childMap.has(child.course_category_id)) {
        childMap.set(child.course_category_id, [])
      }
      childMap.get(child.course_category_id)!.push(child)
    }

    const categoriesWithChildren = categories.map((cat) => ({
      ...cat,
      category_children: childMap.get(cat.id) || []
    }))

    return NextResponse.json(categoriesWithChildren)
  } catch (err: unknown) {
    console.error('Error fetching course categories:', err)
    return NextResponse.json([], { status: 500 })
  }
}
