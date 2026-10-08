'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import InputError from '@/components/input-error'
import LoadingButton from '@/components/loading-button'
import TagInput from '@/components/tag-input'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EditInstructorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [data, setData] = useState({
    designation: '',
    resume: '',
    skills: [] as string[],
    biography: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/instructors/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.instructor) {
          const inst = resData.instructor
          setUserName(inst.name || 'Instructor')
          setData({
            designation: inst.designation || '',
            resume: inst.resume || '',
            skills: inst.skillsList || [],
            biography: inst.biography || '',
          })
        } else {
          toast.error('Instructor profile not found')
        }
      })
      .catch(() => {
        toast.error('Failed to load instructor')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!data.biography.trim()) newErrors.biography = 'Biography is required.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})

    try {
      const res = await fetch(`/api/admin/instructors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation: data.designation,
          skills: data.skills,
          biography: data.biography,
          resume: data.resume || undefined,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Instructor updated successfully!')
        router.push('/dashboard/instructors')
      } else {
        const errorMsg = result.message || 'Failed to update instructor.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      toast.error('Failed to update instructor due to a network error.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Edit Instructor"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Instructors', href: '/dashboard/instructors' },
          { title: 'Edit' },
        ]}
        className="mb-4"
      />

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div>
            <Label htmlFor="instructor_name">Course Instructor</Label>
            <Input
              id="instructor_name"
              readOnly
              value={userName}
              className="mt-1 bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              name="designation"
              className="mt-1"
              value={data.designation}
              onChange={(e) =>
                setData((prev) => ({ ...prev, designation: e.target.value }))
              }
              placeholder="e.g. Senior Software Engineer & Lecturer"
            />
            <InputError message={errors.designation} />
          </div>

          <div>
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              name="resume"
              className="mt-1"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setData((prev) => ({ ...prev, resume: file.name }))
                }
              }}
            />
            {data.resume && (
              <p className="mt-1 text-xs text-muted-foreground">
                Current attached document: <span className="font-mono">{data.resume}</span>
              </p>
            )}
            <InputError message={errors.resume} />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <div className="mt-1">
              <TagInput
                defaultTags={data.skills}
                placeholder="Add skill tag..."
                onChange={(values: string[]) =>
                  setData((prev) => ({ ...prev, skills: values }))
                }
              />
            </div>
            <InputError message={errors.skills} />
          </div>

          <div className="pb-3">
            <Label htmlFor="biography">Biography *</Label>
            <Textarea
              id="biography"
              rows={5}
              required
              name="biography"
              className="mt-1"
              value={data.biography}
              onChange={(e) => {
                setData((prev) => ({ ...prev, biography: e.target.value }))
                setErrors((prev) => ({ ...prev, biography: '' }))
              }}
              placeholder="Provide detailed background, educational credentials, and teaching experience..."
            />
            <InputError message={errors.biography} />
          </div>

          <LoadingButton loading={processing}>
            Update
          </LoadingButton>
        </form>
      </Card>
    </DashboardLayout>
  )
}
