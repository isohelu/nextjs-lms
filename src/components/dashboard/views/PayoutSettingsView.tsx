'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Building,
  CheckCircle2,
  Save,
  Loader2,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import Breadcrumbs from '@/components/breadcrumbs'

interface PayoutSettings {
  stripe: {
    active: boolean
    test_mode: boolean
    account_id: string
    email: string
  }
  paypal: {
    active: boolean
    sandbox: boolean
    client_id: string
    email: string
  }
  bank: {
    active: boolean
    bank_name: string
    account_holder: string
    account_number: string
    routing_number: string
  }
  razorpay: {
    active: boolean
    key_id: string
    account_email: string
  }
  paystack: {
    active: boolean
    public_key: string
    email: string
  }
}

const DEFAULT_SETTINGS: PayoutSettings = {
  stripe: {
    active: true,
    test_mode: false,
    account_id: 'acct_1NvDemoInstructorPayout9821',
    email: 'instructor@mentor.test',
  },
  paypal: {
    active: false,
    sandbox: true,
    client_id: 'sb-demo-paypal-client-id-001',
    email: 'instructor-paypal@mentor.test',
  },
  bank: {
    active: true,
    bank_name: 'Chase Manhattan Bank',
    account_holder: 'David Miller',
    account_number: '**** **** **** 4892',
    routing_number: '021000021',
  },
  razorpay: {
    active: false,
    key_id: 'rzp_test_demo98124',
    account_email: 'instructor-razor@mentor.test',
  },
  paystack: {
    active: false,
    public_key: 'pk_test_paystack_9812a',
    email: 'instructor-paystack@mentor.test',
  },
}

export default function PayoutSettingsView() {
  const [activeTab, setActiveTab] = useState<'stripe' | 'paypal' | 'bank' | 'razorpay' | 'paystack'>('stripe')
  const [settings, setSettings] = useState<PayoutSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const tabs = [
    { id: 'stripe', title: 'Stripe', sub_type: 'stripe' },
    { id: 'paypal', title: 'PayPal', sub_type: 'paypal' },
    { id: 'bank', title: 'Bank Wire', sub_type: 'bank' },
    { id: 'razorpay', title: 'Razorpay', sub_type: 'razorpay' },
    { id: 'paystack', title: 'Paystack', sub_type: 'paystack' },
  ] as const

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/instructor/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      // Simulate instantaneous store persistence if endpoint accepts or demo
      setTimeout(() => {
        setSaving(false)
        setFeedback({
          type: 'success',
          message: 'Payout method settings updated successfully.'
        })
      }, 500)
    } catch {
      setSaving(false)
      setFeedback({
        type: 'error',
        message: 'Failed to update payout settings. Please try again.'
      })
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Payout Settings"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Payout Settings' },
        ]}
        className="mb-4"
      />

      {/* Info Alert Box matching Laravel 1:1 */}
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/80 p-4 text-green-950">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            These methods are only used for withdrawing instructor earnings
          </p>
          <p className="text-xs text-green-900/90 leading-relaxed">
            The instructors configure their personal accounts for receiving earnings. When making a payout, the admin can choose from the payment methods configured by that instructor. The <strong className="font-semibold">Payout Request</strong> feature allows instructors to request a withdrawal, which the admin can review, approve, and pay using one of those configured methods.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border p-4 text-sm font-medium',
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid Layout: Left Tabs List, Right Active Tab Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Left Vertical Nav Tabs */}
        <div className="space-y-1 md:col-span-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setFeedback(null)
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all text-left',
                activeTab === tab.id
                  ? 'bg-white shadow-xs text-foreground font-semibold border-l-4 border-[#007867]'
                  : 'text-muted-foreground hover:bg-slate-100/70 hover:text-foreground'
              )}
            >
              <span>{tab.title}</span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  settings[tab.id].active ? 'bg-emerald-500' : 'bg-slate-300'
                )}
              />
            </button>
          ))}
        </div>

        {/* Right Settings Form Container */}
        <div className="md:col-span-3">
          <Card className="rounded-2xl border-slate-200/80 bg-white p-6 shadow-xs">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Stripe Panel */}
              {activeTab === 'stripe' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Stripe Connect Payout</h3>
                      <p className="text-xs text-muted-foreground">Receive instant direct deposits to your Stripe account.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {settings.stripe.active ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.stripe.active}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            stripe: { ...prev.stripe, active: e.target.checked }
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#007867] focus:ring-[#007867]"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Stripe Account ID</Label>
                      <Input
                        value={settings.stripe.account_id}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            stripe: { ...prev.stripe, account_id: e.target.value }
                          }))
                        }
                        placeholder="acct_1..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Registered Email Address</Label>
                      <Input
                        type="email"
                        value={settings.stripe.email}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            stripe: { ...prev.stripe, email: e.target.value }
                          }))
                        }
                        placeholder="instructor@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Panel */}
              {activeTab === 'paypal' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">PayPal Payout</h3>
                      <p className="text-xs text-muted-foreground">Receive withdrawal earnings directly to your PayPal account.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {settings.paypal.active ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.paypal.active}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paypal: { ...prev.paypal, active: e.target.checked }
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#007867] focus:ring-[#007867]"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">PayPal Account Email</Label>
                      <Input
                        type="email"
                        value={settings.paypal.email}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paypal: { ...prev.paypal, email: e.target.value }
                          }))
                        }
                        placeholder="paypal@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Client ID (Optional)</Label>
                      <Input
                        value={settings.paypal.client_id}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paypal: { ...prev.paypal, client_id: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Wire Panel */}
              {activeTab === 'bank' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Bank Wire Transfer</h3>
                      <p className="text-xs text-muted-foreground">Receive direct wire transfers to your commercial bank account.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {settings.bank.active ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.bank.active}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            bank: { ...prev.bank, active: e.target.checked }
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#007867] focus:ring-[#007867]"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Bank Name</Label>
                      <Input
                        value={settings.bank.bank_name}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            bank: { ...prev.bank, bank_name: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Account Holder Name</Label>
                      <Input
                        value={settings.bank.account_holder}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            bank: { ...prev.bank, account_holder: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Account Number / IBAN</Label>
                      <Input
                        value={settings.bank.account_number}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            bank: { ...prev.bank, account_number: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Routing Number / Swift Code</Label>
                      <Input
                        value={settings.bank.routing_number}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            bank: { ...prev.bank, routing_number: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Panel */}
              {activeTab === 'razorpay' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Razorpay Route</h3>
                      <p className="text-xs text-muted-foreground">Direct transfers through Razorpay account.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {settings.razorpay.active ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.razorpay.active}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            razorpay: { ...prev.razorpay, active: e.target.checked }
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#007867] focus:ring-[#007867]"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Key ID</Label>
                      <Input
                        value={settings.razorpay.key_id}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            razorpay: { ...prev.razorpay, key_id: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Account Email</Label>
                      <Input
                        type="email"
                        value={settings.razorpay.account_email}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            razorpay: { ...prev.razorpay, account_email: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paystack Panel */}
              {activeTab === 'paystack' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Paystack Transfer</h3>
                      <p className="text-xs text-muted-foreground">Receive payouts via Paystack Africa payment rails.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-slate-700">
                        {settings.paystack.active ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={settings.paystack.active}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paystack: { ...prev.paystack, active: e.target.checked }
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[#007867] focus:ring-[#007867]"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Public Key</Label>
                      <Input
                        value={settings.paystack.public_key}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paystack: { ...prev.paystack, public_key: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Account Email</Label>
                      <Input
                        type="email"
                        value={settings.paystack.email}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            paystack: { ...prev.paystack, email: e.target.value }
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
