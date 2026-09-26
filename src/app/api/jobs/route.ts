import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get('all') === 'true'

    const sql = showAll
      ? `SELECT id, uuid, title, slug, experience_level, location,
                salary_min, salary_max, salary_currency, salary_negotiable,
                application_deadline, positions_available, job_type, work_type,
                skills_required, status, created_at
         FROM job_circulars
         ORDER BY id DESC`
      : `SELECT id, uuid, title, slug, experience_level, location,
                salary_min, salary_max, salary_currency, salary_negotiable,
                application_deadline, positions_available, job_type, work_type,
                skills_required, status, created_at
         FROM job_circulars
         WHERE status IN ('published', 'active')
         ORDER BY id DESC`

    const jobs = db.prepare(sql).all() as { skills_required?: string; [key: string]: unknown }[]

    const formatted = jobs.map(j => {
      let skills: string[] = []
      try {
        if (j.skills_required) skills = JSON.parse(j.skills_required)
      } catch {
        skills = []
      }
      return { ...j, skills }
    })

    return NextResponse.json({
      success: true,
      jobs: formatted
    })
  } catch (error: unknown) {
    console.error('Fetch jobs error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve job circulars.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { requireAdmin } = await import('@/lib/auth/session')
    await requireAdmin()
    const { z } = await import('zod')
    const crypto = await import('crypto')

    const createJobSchema = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      experience_level: z.string().default('mid'),
      location: z.string().default('Remote'),
      salary_min: z.number().optional(),
      salary_max: z.number().optional(),
      salary_currency: z.string().default('USD'),
      salary_negotiable: z.boolean().default(false),
      application_deadline: z.string(),
      contact_email: z.string().email(),
      skills_required: z.array(z.string()).optional(),
      positions_available: z.number().int().default(1),
      job_type: z.string().default('full-time'),
      work_type: z.string().default('remote'),
      status: z.string().default('published')
    })

    const body = await req.json()
    const parsed = createJobSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const uuid = crypto.randomUUID()
    const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uuid.substring(0, 8)
    const skillsJson = JSON.stringify(parsed.data.skills_required || [])

    const stmt = db.prepare(`
      INSERT INTO job_circulars (
        uuid, title, slug, description, experience_level, location,
        salary_min, salary_max, salary_currency, salary_negotiable,
        application_deadline, contact_email, skills_required,
        positions_available, job_type, work_type, status,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run(
      uuid,
      parsed.data.title,
      slug,
      parsed.data.description,
      parsed.data.experience_level,
      parsed.data.location,
      parsed.data.salary_min || null,
      parsed.data.salary_max || null,
      parsed.data.salary_currency,
      parsed.data.salary_negotiable ? 1 : 0,
      parsed.data.application_deadline,
      parsed.data.contact_email,
      skillsJson,
      parsed.data.positions_available,
      parsed.data.job_type,
      parsed.data.work_type,
      parsed.data.status
    )

    return NextResponse.json({
      success: true,
      message: 'Job circular created successfully.',
      id: Number(res.lastInsertRowid),
      slug
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required.' }, { status: 403 })
    }
    console.error('Create job error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create job circular.' }, { status: 500 })
  }
}
