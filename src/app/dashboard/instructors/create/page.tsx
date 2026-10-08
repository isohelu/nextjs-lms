'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import Combobox from '@/components/combobox'
import InputError from '@/components/input-error'
import LoadingButton from '@/components/loading-button'
import TagInput from '@/components/tag-input'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function CreateInstructorPage() {
  const router = useRouter()
  const [users, setUsers] = useState<{ label: string; value: string }[]>([])
  const [data, setData] = useState({
    user_id: '',
    designation: '',
    resume: '',
    skills: [] as string[],
    biography: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.users && Array.isArray(resData.users)) {
          setUsers(
            resData.users.map((u: any) => ({
              label: `${u.name} (${u.email})`,
              value: String(u.id),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!data.user_id) newErrors.user_id = 'Course instructor user is required.'
    if (!data.biography.trim()) newErrors.biography = 'Biography is required.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in the required fields.')
      return
    }

    setProcessing(true)
    setErrors({})

    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user_id,
          designation: data.designation,
          skills: data.skills,
          biography: data.biography,
          resume: data.resume || 'resume.pdf',
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        toast.success(result.message || 'Instructor created successfully!')
        router.push('/dashboard/instructors')
      } else {
        const errorMsg = result.message || 'Failed to create instructor.'
        toast.error(errorMsg)
        setErrors(result.errors || { general: errorMsg })
      }
    } catch {
      toast.error('Failed to create instructor due to a network error.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Create Instructor"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Instructors', href: '/dashboard/instructors' },
          { title: 'Create' },
        ]}
        className="mb-4"
      />

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div>
            <Label htmlFor="user_id">Course Instructor *</Label>
            <div className="mt-1">
              <Combobox
                data={users}
                defaultValue={data.user_id}
                placeholder="Select user"
                onSelect={(selected) => {
                  setData((prev) => ({ ...prev, user_id: selected.value }))
                  setErrors((prev) => ({ ...prev, user_id: '' }))
                }}
              />
            </div>
            <InputError message={errors.user_id} />
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
            Submit
          </LoadingButton>
        </form>
      </Card>
    </DashboardLayout>
  )
}
