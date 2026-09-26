'use client'

import React, { useState } from 'react'
import { Camera } from 'lucide-react'
import InputError from '@/components/input-error'
import LoadingButton from '@/components/loading-button'
import TagInput from '@/components/tag-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Instructor {
  id?: string
  designation?: string
  skills?: string | string[]
  biography?: string
}

interface User {
  id?: string
  name?: string
  email?: string
  photo?: string
  role?: string
  social_links?: any
}

interface Props {
  user?: User
  instructor?: Instructor
}

const UpdateProfile = ({ user: initialUser, instructor: initialInstructor }: Props) => {
  const [photo, setPhoto] = useState<string | null>(initialUser?.photo || null)
  const [name, setName] = useState(initialUser?.name || 'Dr. Angela Yu')
  const [designation, setDesignation] = useState(initialInstructor?.designation || 'Lead Instructor & Developer')
  const [biography, setBiography] = useState(initialInstructor?.biography || 'Passionate educator with over 10 years of experience teaching web development and data science.')
  const [socialLinks, setSocialLinks] = useState({
    website: 'https://example.com',
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  })

  const initialSkillsList = initialInstructor?.skills
    ? Array.isArray(initialInstructor.skills)
      ? initialInstructor.skills
      : typeof initialInstructor.skills === 'string'
      ? JSON.parse(initialInstructor.skills || '[]')
      : []
    : ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python']

  const [skills, setSkills] = useState<string[]>(initialSkillsList)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setSuccess('')
    setErrors({})

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          designation,
          biography,
          skills,
          social_links: socialLinks,
          photo,
        }),
      })
      if (res.ok) {
        setSuccess('Profile updated successfully.')
      } else {
        const data = await res.json()
        setErrors(data.errors || { name: data.message || 'Failed to update profile' })
      }
    } catch {
      setErrors({ name: 'An unexpected network error occurred.' })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6 shadow">
      {success && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="flex w-full flex-col items-center space-y-3 text-center md:max-w-40">
          <div className="relative mb-4 h-25 w-25">
            {photo ? (
              <img
                alt="user avatar"
                src={photo}
                className="h-25 w-25 rounded-full object-cover"
              />
            ) : (
              <div className="h-25 w-25 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xl">
                {name.charAt(0) || 'U'}
              </div>
            )}

            <label
              htmlFor="formFileSm"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-muted hover:bg-muted/80 shadow transition">
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
            </label>
            <input
              hidden
              type="file"
              id="formFileSm"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          <small className="text-xs text-muted-foreground">
            Allowed: JPG, JPEG, PNG, SVG File, Maximum 2MB
          </small>

          {errors.photo && (
            <p className="mt-1 text-sm text-destructive">{errors.photo}</p>
          )}
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>Website</Label>
            <Input
              type="url"
              value={socialLinks.website}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, website: e.target.value })
              }
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label>GitHub</Label>
            <Input
              type="url"
              value={socialLinks.github}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, github: e.target.value })
              }
              placeholder="https://github.com/my-profile"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Twitter</Label>
            <Input
              type="url"
              value={socialLinks.twitter}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, twitter: e.target.value })
              }
              placeholder="https://twitter.com/my-profile"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={socialLinks.linkedin}
              onChange={(e) =>
                setSocialLinks({ ...socialLinks, linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/my-profile"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1"
        />
        <InputError message={errors.name} />
      </div>

      <div>
        <Label>Designation</Label>
        <Input
          name="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Software Engineer"
          className="mt-1"
        />
        <InputError message={errors.designation} />
      </div>

      <div>
        <Label>Resume</Label>
        <Input type="file" name="resume" className="mt-1" />
        <InputError message={errors.resume} />
      </div>

      <div>
        <Label>Skills</Label>
        <div className="mt-1">
          <TagInput
            defaultTags={skills}
            placeholder="Enter the skills as a tag"
            onChange={(values: string[]) => setSkills(values)}
          />
        </div>
      </div>

      <div>
        <Label>Biography</Label>
        <Textarea
          rows={5}
          required
          name="biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          placeholder="Write about yourself"
          className="mt-1"
        />
        <InputError message={errors.biography} />
      </div>

      <div className="flex items-center justify-end">
        <LoadingButton loading={processing}>
          Save Changes
        </LoadingButton>
      </div>
    </form>
  )
}

export default UpdateProfile
