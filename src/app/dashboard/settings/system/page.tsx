'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import LoadingButton from '@/components/loading-button'
import Combobox from '@/components/combobox'
import CssEditor from '@/components/css-editor'
import currencies from '@/data/currencies'
import { Eye, Edit, CheckCircle2, Sliders, Layout, Layers, Palette, Save, Upload, X, Receipt, FileText, Building, Printer } from 'lucide-react'

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('website')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // System form state
  const [fields, setFields] = useState({
    name: 'Mentor Learning Management System',
    title: 'Mentor LMS Platform',
    slogan: 'A course based video CMS',
    keywords: 'lms, elearning, online courses, tutorials, education',
    description: 'Empowering learners worldwide with comprehensive modern courses, exams, and certifications.',
    author: 'Mentor Team',
    email: 'admin@mentorlms.com',
    phone: '+123 45 678 9201',
    direction: 'none',
    theme: 'system',
    language_selector: '1',
    selling_currency: 'USD',
    selling_tax: '5',
    instructor_revenue: '70',
    global_style: '',
    // Invoice Configuration
    invoice_company_name: 'Mentor Learning Management System Inc.',
    invoice_company_logo: '/assets/icons/logo-dark.png',
    invoice_company_email: 'billing@mentorlms.com',
    invoice_company_phone: '+1 (555) 234-5678',
    invoice_company_address: '100 Innovation Way, Suite 400, San Francisco, CA 94105, USA',
    invoice_tax_number: 'US-EIN 84-2918392',
    invoice_prefix: 'INV-',
    invoice_footer_note: 'Thank you for learning with Mentor LMS. This receipt serves as official proof of registration and lifetime course access.',
    invoice_terms: 'All purchases are subject to our 30-day money-back guarantee. Access credentials and learning materials are non-transferable.',
  })

  // Media preview state
  const [mediaPreviews, setMediaPreviews] = useState<{
    logo_dark?: string
    logo_light?: string
    favicon?: string
    banner?: string
    auth_banner?: string
  }>({})

  // Navbar and Footer items state
  const [navbarItems, setNavbarItems] = useState<any[]>([])
  const [footerSections, setFooterSections] = useState<any[]>([])
  const [navbarEditMode, setNavbarEditMode] = useState(false)
  const [footerEditMode, setFooterEditMode] = useState(false)

  // Fetch initial system settings
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings/system')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setFields(prev => ({
              ...prev,
              ...data.settings,
              selling_tax: String(data.settings.selling_tax ?? '5'),
              instructor_revenue: String(data.settings.instructor_revenue ?? '70'),
              language_selector: data.settings.language_selector ? '1' : '0',
            }))
          }
          if (data.navbarItems) {
            setNavbarItems(data.navbarItems)
          }
          if (data.footerSections) {
            setFooterSections(data.footerSections)
          }
        }
      } catch (err) {
        console.error('Error fetching system settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleFieldChange = (key: string, value: any) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setMediaPreviews(prev => ({ ...prev, [key]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          selling_tax: Number(fields.selling_tax) || 0,
          instructor_revenue: Number(fields.instructor_revenue) || 0,
          language_selector: fields.language_selector === '1',
          ...mediaPreviews,
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMessage('System settings saved successfully.')
      } else {
        alert(data.message || 'Failed to save system settings.')
      }
    } catch {
      alert('Error updating system settings.')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-4">
        <Breadcrumbs
          title="System Settings"
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Settings' },
            { title: 'System Settings' },
          ]}
          className="mb-4"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="md:px-3">
          <div className="overflow-x-auto overflow-y-hidden">
            <TabsList className="h-13 px-2">
              <TabsTrigger value="website" className="h-10 cursor-pointer px-6">
                Website
              </TabsTrigger>
              <TabsTrigger value="invoice" className="h-10 cursor-pointer px-6 flex items-center gap-1.5 font-semibold">
                <Receipt className="h-4 w-4 text-primary" />
                Invoice & Receipts
              </TabsTrigger>
              <TabsTrigger value="navbar" className="h-10 cursor-pointer px-6">
                Navbar
              </TabsTrigger>
              <TabsTrigger value="footer" className="h-10 cursor-pointer px-6">
                Footer
              </TabsTrigger>
              <TabsTrigger value="style" className="h-10 cursor-pointer px-6">
                Style
              </TabsTrigger>
            </TabsList>
          </div>

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB: Website */}
          <TabsContent value="website" className="mt-4">
            <Card className="p-4 sm:p-6">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Website Information */}
                <div className="border-b pb-6">
                  <h2 className="mb-4 text-xl font-semibold">Website Information</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label>Website Name</Label>
                      <Input
                        value={fields.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Enter Website Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Website Title</Label>
                      <Input
                        value={fields.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Enter Website Title"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Keywords</Label>
                      <Input
                        value={fields.keywords}
                        onChange={(e) => handleFieldChange('keywords', e.target.value)}
                        placeholder="e.g. lms, courses, education"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={4}
                        value={fields.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        placeholder="Enter Website Description"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Slogan</Label>
                      <Input
                        value={fields.slogan}
                        onChange={(e) => handleFieldChange('slogan', e.target.value)}
                        placeholder="A course based video CMS"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Author</Label>
                      <Input
                        value={fields.author}
                        onChange={(e) => handleFieldChange('author', e.target.value)}
                        placeholder="Author Name"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-b pb-6">
                  <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label>System Email *</Label>
                      <Input
                        type="email"
                        value={fields.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="Enter System Email"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={fields.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="Enter Phone Number"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Settings */}
                <div className="border-b pb-6">
                  <h2 className="mb-4 text-xl font-semibold">Media</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label>Logo Dark</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('logo_dark', e)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Logo Light</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('logo_light', e)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Favicon</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('favicon', e)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Banner</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('banner', e)}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>
                        Auth Banner <span className="text-xs text-muted-foreground">(For Login, Register, etc pages)</span>
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('auth_banner', e)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Additional Settings</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <Label>Website Direction</Label>
                      <Select
                        value={fields.direction}
                        onValueChange={(val) => handleFieldChange('direction', val)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="ltr">LTR</SelectItem>
                          <SelectItem value="rtl">RTL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Default Theme</Label>
                      <Select
                        value={fields.theme}
                        onValueChange={(val) => handleFieldChange('theme', val)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Language Selector</Label>
                      <Select
                        value={fields.language_selector}
                        onValueChange={(val) => handleFieldChange('language_selector', val)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Show</SelectItem>
                          <SelectItem value="0">Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{`Course Selling Currency (${fields.selling_currency})`}</Label>
                      <div className="mt-1">
                        <Combobox
                          data={currencies}
                          defaultValue={fields.selling_currency}
                          placeholder="Select selling currency"
                          onSelect={(item) => handleFieldChange('selling_currency', item.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Course Selling Tax (%)</Label>
                      <Input
                        type="number"
                        value={fields.selling_tax}
                        onChange={(e) => handleFieldChange('selling_tax', e.target.value)}
                        placeholder="Enter Course Selling Tax Percentage"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Instructor Revenue (%)</Label>
                      <Input
                        type="number"
                        value={fields.instructor_revenue}
                        onChange={(e) => handleFieldChange('instructor_revenue', e.target.value)}
                        placeholder="Enter Instructor Revenue Percentage"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <LoadingButton loading={saving} type="submit">
                    Save Changes
                  </LoadingButton>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* TAB: Navbar */}
          <TabsContent value="navbar" className="mt-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Live Navbar Preview
                    </CardTitle>
                    <CardDescription className="hidden sm:block">
                      Interactive preview Navbar 1 (navbar_1)
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setNavbarEditMode(!navbarEditMode)}
                      variant={navbarEditMode ? 'outline' : 'default'}
                      className="flex items-center gap-2"
                    >
                      {navbarEditMode ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      {navbarEditMode ? 'Close' : 'Edit Navbar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="space-y-6 p-4 md:p-6">
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Before Login Preview
                  </p>
                  <div className="rounded-xl border border-border/80 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="font-black text-lg text-foreground tracking-tight">MENTOR</span>
                      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
                        <span>Courses</span>
                        <span>Exams</span>
                        <span>Store</span>
                        <span>About Us</span>
                        <span>Our Team</span>
                        <span>Blogs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold rounded-xl">Sign In</Button>
                      <Button size="sm" className="text-xs font-bold bg-[#D8FC38] hover:bg-[#CBF128] text-slate-950 rounded-xl shadow-xs">Get Started</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    After Login Preview
                  </p>
                  <div className="rounded-xl border border-border/80 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="font-black text-lg text-foreground tracking-tight">MENTOR</span>
                      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
                        <span>Dashboard</span>
                        <span>My Courses</span>
                        <span>Exams</span>
                        <span>Wishlist</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        AD
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Footer */}
          <TabsContent value="footer" className="mt-4">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Live Footer Preview
                    </CardTitle>
                    <CardDescription className="hidden sm:block">
                      Interactive preview Footer 1 (footer_1)
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setFooterEditMode(!footerEditMode)}
                      variant={footerEditMode ? 'outline' : 'default'}
                      className="flex items-center gap-2"
                    >
                      {footerEditMode ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      {footerEditMode ? 'Close' : 'Edit Footer'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="space-y-6 p-4 md:p-6">
                <div className="rounded-xl border border-border/80 bg-slate-900 text-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <h3 className="font-black text-lg text-white">MENTOR LMS</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        The modern learning management system built for high-performance course academies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Quick Links</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li>About Us</li>
                        <li>Courses</li>
                        <li>Exams</li>
                        <li>Careers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Legal</h4>
                      <ul className="space-y-2 text-xs text-slate-400">
                        <li>Terms and Conditions</li>
                        <li>Privacy Policy</li>
                        <li>Cookie Policy</li>
                        <li>Refund Policy</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">Contact</h4>
                      <p className="text-xs text-slate-400">{fields.email}</p>
                      <p className="text-xs text-slate-400 mt-1">{fields.phone}</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} {fields.name}. All rights reserved.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Invoice & Receipts */}
          <TabsContent value="invoice" className="mt-4">
            <Card className="p-4 sm:p-6 space-y-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Receipt className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Official Invoice & Receipt Configuration</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customize the company branding, address, tax registration, and footer notices printed on student invoices and receipts.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inv_name">Company / Organization Legal Name *</Label>
                    <Input
                      id="inv_name"
                      value={fields.invoice_company_name || ''}
                      onChange={(e) => handleFieldChange('invoice_company_name', e.target.value)}
                      placeholder="Mentor Learning Management System Inc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv_logo">Invoice Logo URL / Path</Label>
                    <Input
                      id="inv_logo"
                      value={fields.invoice_company_logo || ''}
                      onChange={(e) => handleFieldChange('invoice_company_logo', e.target.value)}
                      placeholder="/assets/icons/logo-dark.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv_email">Billing & Invoicing Email *</Label>
                    <Input
                      id="inv_email"
                      type="email"
                      value={fields.invoice_company_email || ''}
                      onChange={(e) => handleFieldChange('invoice_company_email', e.target.value)}
                      placeholder="billing@mentorlms.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv_phone">Billing Phone</Label>
                    <Input
                      id="inv_phone"
                      value={fields.invoice_company_phone || ''}
                      onChange={(e) => handleFieldChange('invoice_company_phone', e.target.value)}
                      placeholder="+1 (555) 234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv_tax">Tax / VAT / EIN Registration Number</Label>
                    <Input
                      id="inv_tax"
                      value={fields.invoice_tax_number || ''}
                      onChange={(e) => handleFieldChange('invoice_tax_number', e.target.value)}
                      placeholder="US-EIN 84-2918392"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv_prefix">Invoice Number Prefix</Label>
                    <Input
                      id="inv_prefix"
                      value={fields.invoice_prefix || ''}
                      onChange={(e) => handleFieldChange('invoice_prefix', e.target.value)}
                      placeholder="INV-"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="inv_addr">Full Business / Headquarters Address *</Label>
                    <Textarea
                      id="inv_addr"
                      rows={2}
                      value={fields.invoice_company_address || ''}
                      onChange={(e) => handleFieldChange('invoice_company_address', e.target.value)}
                      placeholder="100 Innovation Way, Suite 400, San Francisco, CA 94105, USA"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="inv_footer">Invoice Footer Note / Thank You Message</Label>
                    <Textarea
                      id="inv_footer"
                      rows={2}
                      value={fields.invoice_footer_note || ''}
                      onChange={(e) => handleFieldChange('invoice_footer_note', e.target.value)}
                      placeholder="Thank you for learning with Mentor LMS. This receipt serves as official proof of registration."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="inv_terms">Invoice Terms & Conditions</Label>
                    <Textarea
                      id="inv_terms"
                      rows={2}
                      value={fields.invoice_terms || ''}
                      onChange={(e) => handleFieldChange('invoice_terms', e.target.value)}
                      placeholder="All purchases are subject to our 30-day money-back guarantee. Access credentials and learning materials are non-transferable."
                    />
                  </div>
                </div>

                {/* Live Invoice Preview Box */}
                <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Live Invoice Layout Preview
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Standard Vector Printable Layout</span>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-6 shadow-sm text-xs space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-start border-b pb-4">
                      <div className="space-y-1">
                        <img
                          src={fields.invoice_company_logo || '/assets/icons/logo-dark.png'}
                          alt="Logo"
                          className="h-8 object-contain mb-2"
                        />
                        <p className="font-bold text-sm text-foreground">{fields.invoice_company_name || fields.name}</p>
                        <p className="text-muted-foreground">{fields.invoice_company_address}</p>
                        <p className="text-muted-foreground">{fields.invoice_company_email} • {fields.invoice_company_phone}</p>
                        {fields.invoice_tax_number && (
                          <p className="text-muted-foreground font-mono">Tax ID: {fields.invoice_tax_number}</p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-base font-extrabold text-foreground">INVOICE</p>
                        <p className="font-mono font-bold text-foreground">#{fields.invoice_prefix || 'INV-'}93151802</p>
                        <p className="text-muted-foreground">Date: {new Date().toLocaleDateString('en-US')}</p>
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                          PAID
                        </span>
                      </div>
                    </div>

                    <div className="rounded border divide-y text-xs">
                      <div className="bg-muted/40 p-2 flex justify-between font-bold">
                        <span>Item Description</span>
                        <span>Amount</span>
                      </div>
                      <div className="p-2 flex justify-between">
                        <span>Sample Course / Digital Store Asset</span>
                        <span className="font-bold">$19.99</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-xs">
                      <p className="text-muted-foreground">Tax (5%): $1.00</p>
                      <p className="text-sm font-bold text-foreground">Total: $20.99</p>
                    </div>

                    <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{fields.invoice_footer_note}</p>
                      <p>{fields.invoice_terms}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <LoadingButton loading={saving} type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice Settings
                  </LoadingButton>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* TAB: Style */}
          <TabsContent value="style" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Custom Global Style
                </CardTitle>
                <CardDescription className="hidden sm:block">
                  Inject custom CSS rules and overrides directly into the platform layout.
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="p-4 sm:p-6 space-y-6">
                <div>
                  <CssEditor
                    value={fields.global_style}
                    setValue={(val) => handleFieldChange('global_style', val)}
                  />
                </div>

                <div className="flex justify-end">
                  <LoadingButton loading={saving} onClick={() => handleSave()}>
                    Save Changes
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
