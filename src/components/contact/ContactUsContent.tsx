'use client'

import React, { useState } from 'react'
import legalPages from '@/lib/data/legal-pages.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'

const pageData = legalPages['contact-us']

export default function ContactUsContent() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
      } else {
        setErrorMessage(data.message || 'Failed to submit inquiry. Please check your fields.')
      }
    } catch {
      setErrorMessage('Failed to connect to contact service. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 space-y-16">
      {/* Contact Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Support Email</h3>
          <p className="text-xs text-muted-foreground">
            Response time within 24 hours.
          </p>
          <a
            href="mailto:support@uilib.com"
            className="text-sm font-semibold text-primary hover:underline block pt-1"
          >
            support@uilib.com
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Direct Hotline</h3>
          <p className="text-xs text-muted-foreground">
            Mon-Fri from 9:00 AM to 6:00 PM EST.
          </p>
          <a
            href="tel:+8801123456780"
            className="text-sm font-semibold text-primary hover:underline block pt-1"
          >
            +880 1123 456 780
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Headquarters</h3>
          <p className="text-xs text-muted-foreground">
            Mentor Global Operations
          </p>
          <p className="text-sm font-semibold text-foreground pt-1">
            123 Education Street Learning City, LC 12345
          </p>
        </div>
      </div>

      {/* Two Column Layout: Official Details Card & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Official Database Content */}
        <div className="lg:col-span-7 rounded-2xl bg-muted px-6 py-10 md:px-12 prose dark:prose-invert">
          <div
            className="leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: pageData.description }}
          />
        </div>

        {/* Interactive Form */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-foreground">{formData.name}</span>. Our team has received your message and will reply to <span className="font-semibold text-foreground">{formData.email}</span> within 24 hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-4"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-foreground">Send Us a Message</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Have questions? Fill out the form below and we will get back to you promptly.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Your Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alexander Wright"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. alexander@example.com"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject *</label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Course inquiry"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Message *</label>
                <Textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="rounded-xl resize-none"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full font-bold cursor-pointer">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Submit Message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
