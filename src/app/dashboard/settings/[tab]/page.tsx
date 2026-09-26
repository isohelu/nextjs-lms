'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  User,
  Sliders,
  FileText,
  HardDrive,
  Mail,
  Puzzle,
  Shield,
  Video,
  Activity,
  BarChart2,
  Wrench,
  CheckCircle2,
  Save,
  Loader2,
  Lock,
  ExternalLink
} from 'lucide-react'

export type SettingsTab =
  | 'account'
  | 'system'
  | 'pages'
  | 'storage'
  | 'smtp'
  | 'plugins'
  | 'auth0'
  | 'live-class'
  | 'meta-pixel'
  | 'google-analytics'
  | 'maintenance'

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'system', label: 'System', icon: Sliders },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'smtp', label: 'SMTP', icon: Mail },
  { id: 'plugins', label: 'Plugins', icon: Puzzle },
  { id: 'auth0', label: 'Auth', icon: Shield },
  { id: 'live-class', label: 'Live Class', icon: Video },
  { id: 'meta-pixel', label: 'Meta Pixel', icon: Activity },
  { id: 'google-analytics', label: 'Google Analytics', icon: BarChart2 },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
]

export default function DashboardSettingsTabRoute({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const resolvedParams = use(params)
  const initialTab = (resolvedParams.tab as SettingsTab) || 'system'
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'student' | null>(null)

  // Fetch role and enforce access control
  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          const role = data.user?.role
          setUserRole(role)
          if (role === 'instructor' && resolvedParams.tab !== 'account') {
            router.replace('/dashboard/settings/account')
          }
        }
      } catch {
        // ignore
      }
    }
    checkRole()
  }, [resolvedParams.tab, router])

  // Sync state if URL changes
  useEffect(() => {
    if (resolvedParams.tab && resolvedParams.tab !== activeTab) {
      setActiveTab(resolvedParams.tab as SettingsTab)
    }
  }, [resolvedParams.tab])

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab)
    router.push(`/dashboard/settings/${tab}`)
  }

  // Generic loading and save feedback
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: 'Platform Administrator',
    email: 'admin@admin.com',
    headline: 'Chief Educational Officer & Senior Architect',
    bio: 'Overseeing comprehensive educational operations, course delivery pipelines, and platform growth.',
    current_password: '',
    new_password: '',
  })

  const [systemForm, setSystemForm] = useState({
    name: 'Mentor Learning Management System',
    title: 'Mentor LMS Platform',
    slogan: 'A course based video CMS',
    email: 'admin@mentorlms.com',
    phone: '+123 45 678 9201',
    selling_currency: 'USD',
    selling_tax: 5,
    instructor_revenue: 70,
    direction: 'none',
  })

  const [pagesForm, setPagesForm] = useState({
    page_name: 'Collaborative 1',
    page_slug: 'home-1',
  })

  const [storageForm, setStorageForm] = useState({
    storage_driver: 'local',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_default_region: 'us-east-1',
    aws_bucket: '',
  })

  const [smtpForm, setSmtpForm] = useState({
    mail_mailer: 'smtp',
    mail_host: 'smtp.mailgun.org',
    mail_port: '587',
    mail_username: 'postmaster@mentorlms.com',
    mail_password: '••••••••••••',
    mail_encryption: 'tls',
    mail_from_address: 'no-reply@mentorlms.com',
    mail_from_name: 'Mentor LMS Notifications',
  })

  const [liveClassForm, setLiveClassForm] = useState({
    zoom_account_email: 'zoom@mentorlms.com',
    zoom_account_id: 'zm_acc_892110',
    zoom_client_id: 'zm_cli_991823',
    zoom_client_secret: '••••••••••••••••',
  })

  const [metaPixelForm, setMetaPixelForm] = useState({
    pixel_enabled: false,
    pixel_id: '',
    capi_enabled: false,
    access_token: '',
  })

  const [gaForm, setGaForm] = useState({
    analytics_enabled: true,
    measurement_id: 'G-LMS8920199',
    mp_enabled: false,
    api_secret: '',
  })

  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    bypass_secret: 'mentor-secret-bypass-2026',
  })

  // Load data for active tab
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (activeTab === 'account') {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              setAccountForm(prev => ({
                ...prev,
                name: data.user.name || prev.name,
                email: data.user.email || prev.email,
                headline: data.user.headline || prev.headline,
                bio: data.user.bio || prev.bio
              }))
            }
          }
        } else {
          const res = await fetch(`/api/admin/settings/${activeTab}`)
          if (res.ok) {
            const data = await res.json()
            if (data.settings) {
              if (activeTab === 'system') setSystemForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'pages') setPagesForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'storage') setStorageForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'smtp') setSmtpForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'live-class') setLiveClassForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'meta-pixel') setMetaPixelForm(prev => ({ ...prev, ...data.settings }))
              if (activeTab === 'google-analytics') setGaForm(prev => ({ ...prev, ...data.settings }))
            }
            if (activeTab === 'maintenance' && data.maintenance) {
              setMaintenanceForm(data.maintenance)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings for tab:', activeTab, err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeTab])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      let bodyData: any = {}
      if (activeTab === 'account') {
        const res = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: accountForm.name,
            headline: accountForm.headline,
            bio: accountForm.bio
          })
        })
        const resJson = await res.json()
        if (resJson.success) {
          setSuccessMessage('Account details updated successfully.')
        } else {
          alert(resJson.message || 'Failed to update account.')
        }
        return
      }

      if (activeTab === 'system') bodyData = systemForm
      if (activeTab === 'pages') bodyData = pagesForm
      if (activeTab === 'storage') bodyData = storageForm
      if (activeTab === 'smtp') bodyData = smtpForm
      if (activeTab === 'live-class') bodyData = liveClassForm
      if (activeTab === 'meta-pixel') bodyData = metaPixelForm
      if (activeTab === 'google-analytics') bodyData = gaForm
      if (activeTab === 'maintenance') bodyData = maintenanceForm

      const res = await fetch(`/api/admin/settings/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('Configuration changes saved successfully.')
      } else {
        alert(data.message || 'Failed to save settings.')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Error saving configuration settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

    const visibleTabs = userRole === 'instructor' ? TABS.filter(t => t.id === 'account') : TABS

  return (
    <DashboardLayout role={userRole === 'instructor' ? 'instructor' : 'admin'}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Breadcrumbs */}
        <Breadcrumbs
          title={userRole === 'instructor' ? 'Account Settings' : 'Settings'}
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: visibleTabs.find((t) => t.id === activeTab)?.label || 'System' },
          ]}
          className="mb-4"
        />

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/60 scrollbar-none">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#007867] text-white shadow-xs'
                    : 'text-muted-foreground hover:bg-white hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="p-6 rounded-2xl border border-border/80 bg-white shadow-xs">
            <form onSubmit={handleSave} className="space-y-6">
              {/* TAB: Account */}
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Personal Profile & Credentials</h3>
                    <p className="text-xs text-muted-foreground">Update your administrative bio and public instructor representation.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Display Name</Label>
                      <Input
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Email Address</Label>
                      <Input
                        disabled
                        value={accountForm.email}
                        className="mt-1 text-xs bg-slate-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Professional Headline</Label>
                    <Input
                      value={accountForm.headline}
                      onChange={(e) => setAccountForm({ ...accountForm, headline: e.target.value })}
                      placeholder="e.g. Senior Course Instructor"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Biography</Label>
                    <Textarea
                      rows={4}
                      value={accountForm.bio}
                      onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB: System */}
              {activeTab === 'system' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">System Platform Settings</h3>
                    <p className="text-xs text-muted-foreground">Platform branding, taxation, and default currencies.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Platform Brand Name</Label>
                      <Input
                        value={systemForm.name}
                        onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Brand Slogan</Label>
                      <Input
                        value={systemForm.slogan}
                        onChange={(e) => setSystemForm({ ...systemForm, slogan: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Support Email</Label>
                      <Input
                        value={systemForm.email}
                        onChange={(e) => setSystemForm({ ...systemForm, email: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Support Phone</Label>
                      <Input
                        value={systemForm.phone}
                        onChange={(e) => setSystemForm({ ...systemForm, phone: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Platform Currency</Label>
                      <Input
                        value={systemForm.selling_currency}
                        onChange={(e) => setSystemForm({ ...systemForm, selling_currency: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={systemForm.selling_tax}
                        onChange={(e) => setSystemForm({ ...systemForm, selling_tax: Number(e.target.value) })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Instructor Revenue Share (%)</Label>
                      <Input
                        type="number"
                        value={systemForm.instructor_revenue}
                        onChange={(e) => setSystemForm({ ...systemForm, instructor_revenue: Number(e.target.value) })}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Pages */}
              {activeTab === 'pages' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Homepage Preset Selection</h3>
                    <p className="text-xs text-muted-foreground">Select which layout theme powers the public root `/` landing page.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[
                      { slug: 'home-1', name: 'Collaborative 1', desc: 'Featured hero with stats, top categories, and newsletter blast' },
                      { slug: 'home-2', name: 'Collaborative 2', desc: 'Modern card grid with partner logos and test testimonials' },
                      { slug: 'home-3', name: 'Creative Focus', desc: 'Dynamic artistic layout for creative workshops' },
                      { slug: 'home-4', name: 'Enterprise Pro', desc: 'Structured for corporate training and accredited diplomas' },
                      { slug: 'home-5', name: 'Single Instructor', desc: 'Tailored for personal brand educational suites' },
                    ].map((preset) => (
                      <div
                        key={preset.slug}
                        onClick={() => setPagesForm({ page_slug: preset.slug, page_name: preset.name })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          pagesForm.page_slug === preset.slug
                            ? 'border-[#007867] bg-[#007867]/5 shadow-xs'
                            : 'border-border/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-foreground">{preset.name}</h4>
                          {pagesForm.page_slug === preset.slug && (
                            <Badge className="bg-[#007867] text-[10px]">Active</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{preset.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Storage */}
              {activeTab === 'storage' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Media & Asset Storage Driver</h3>
                    <p className="text-xs text-muted-foreground">Configure storage destinations for course videos, PDFs, and avatars.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold">Active Storage Driver</Label>
                      <select
                        value={storageForm.storage_driver}
                        onChange={(e) => setStorageForm({ ...storageForm, storage_driver: e.target.value })}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="local">Local Filesystem Storage (Default)</option>
                        <option value="s3">Amazon S3 Object Storage</option>
                        <option value="r2">Cloudflare R2 Storage</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">AWS Access Key ID</Label>
                      <Input
                        value={storageForm.aws_access_key_id}
                        onChange={(e) => setStorageForm({ ...storageForm, aws_access_key_id: e.target.value })}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">AWS Secret Access Key</Label>
                      <Input
                        type="password"
                        value={storageForm.aws_secret_access_key}
                        onChange={(e) => setStorageForm({ ...storageForm, aws_secret_access_key: e.target.value })}
                        placeholder="••••••••••••••••••••••••"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">AWS Region</Label>
                      <Input
                        value={storageForm.aws_default_region}
                        onChange={(e) => setStorageForm({ ...storageForm, aws_default_region: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">S3 Bucket Name</Label>
                      <Input
                        value={storageForm.aws_bucket}
                        onChange={(e) => setStorageForm({ ...storageForm, aws_bucket: e.target.value })}
                        placeholder="mentor-lms-production-bucket"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SMTP */}
              {activeTab === 'smtp' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">SMTP Mail Server Configuration</h3>
                    <p className="text-xs text-muted-foreground">Credentials for transactional account alerts, notifications, and reset links.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">SMTP Host</Label>
                      <Input
                        value={smtpForm.mail_host}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_host: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">SMTP Port</Label>
                      <Input
                        value={smtpForm.mail_port}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_port: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">SMTP Username</Label>
                      <Input
                        value={smtpForm.mail_username}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_username: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">SMTP Password</Label>
                      <Input
                        type="password"
                        value={smtpForm.mail_password}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_password: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">From Email Address</Label>
                      <Input
                        value={smtpForm.mail_from_address}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_from_address: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Sender Display Name</Label>
                      <Input
                        value={smtpForm.mail_from_name}
                        onChange={(e) => setSmtpForm({ ...smtpForm, mail_from_name: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Plugins */}
              {activeTab === 'plugins' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Official System Plugins</h3>
                    <p className="text-xs text-muted-foreground">Modular extensions enabling AI content generation, certificates, and offline gateways.</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'AIAssistant', title: 'AI Assistant', desc: 'Generates course outlines, quiz questions, and lecture summaries with LLMs.' },
                      { name: 'Certification', title: 'Certificates & Marksheets', desc: 'Enables custom PDF certificates and academic transcripts.' },
                      { name: 'OfflinePayment', title: 'Offline Payments', desc: 'Enables direct bank wire and receipt upload verification.' },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-slate-50/50">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[10px]">Enabled</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Auth */}
              {activeTab === 'auth0' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">OAuth & Social Authentication</h3>
                    <p className="text-xs text-muted-foreground">Enable Google, Auth0, or Social Single Sign-On.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Google Client ID</Label>
                      <Input placeholder="apps.googleusercontent.com" className="mt-1 text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Google Client Secret</Label>
                      <Input type="password" placeholder="••••••••••••••••" className="mt-1 text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Live Class */}
              {activeTab === 'live-class' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Zoom Video Integration</h3>
                    <p className="text-xs text-muted-foreground">Configure Zoom Server-to-Server OAuth credentials for live webinars.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Zoom Account ID</Label>
                      <Input
                        value={liveClassForm.zoom_account_id}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, zoom_account_id: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Zoom Client ID</Label>
                      <Input
                        value={liveClassForm.zoom_client_id}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, zoom_client_id: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold">Zoom Client Secret</Label>
                      <Input
                        type="password"
                        value={liveClassForm.zoom_client_secret}
                        onChange={(e) => setLiveClassForm({ ...liveClassForm, zoom_client_secret: e.target.value })}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Meta Pixel */}
              {activeTab === 'meta-pixel' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Meta Pixel & Conversion API</h3>
                    <p className="text-xs text-muted-foreground">Track marketing conversions, lead acquisitions, and checkout funnels.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">Meta Pixel ID</Label>
                      <Input
                        value={metaPixelForm.pixel_id}
                        onChange={(e) => setMetaPixelForm({ ...metaPixelForm, pixel_id: e.target.value })}
                        placeholder="e.g. 192837465019"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold">Conversion API Access Token</Label>
                      <Input
                        type="password"
                        value={metaPixelForm.access_token}
                        onChange={(e) => setMetaPixelForm({ ...metaPixelForm, access_token: e.target.value })}
                        placeholder="EAABw..."
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Google Analytics */}
              {activeTab === 'google-analytics' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Google Analytics 4</h3>
                    <p className="text-xs text-muted-foreground">Monitor real-time visitors, engagement duration, and course traffic sources.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold">GA4 Measurement ID</Label>
                      <Input
                        value={gaForm.measurement_id}
                        onChange={(e) => setGaForm({ ...gaForm, measurement_id: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Maintenance */}
              {activeTab === 'maintenance' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Maintenance Mode</h3>
                    <p className="text-xs text-muted-foreground">Take platform offline for major system updates while permitting admin bypass.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-amber-950">Maintenance Mode Status</h4>
                        <p className="text-xs text-amber-800/80">When enabled, visitors will see the temporary 503 maintenance screen.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaintenanceForm({ ...maintenanceForm, enabled: !maintenanceForm.enabled })}
                        className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer ${
                          maintenanceForm.enabled ? 'bg-amber-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${
                            maintenanceForm.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-amber-900">Bypass Secret Key</Label>
                      <Input
                        value={maintenanceForm.bypass_secret}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, bypass_secret: e.target.value })}
                        className="mt-1 text-xs bg-white"
                      />
                      <p className="text-[11px] text-amber-700/80 mt-1">
                        Admins can append <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">?secret={maintenanceForm.bypass_secret}</code> to access the platform.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t border-border/60 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#007867] hover:bg-[#007867]/90 text-white font-medium text-xs h-9 px-5 gap-2 rounded-xl"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
