'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Check,
  Globe,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminPaymentGatewaysPage() {
  const [activeGateway, setActiveGateway] = useState<'stripe' | 'paypal' | 'razorpay' | 'offline'>('stripe')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Gateways config state
  const [stripeConfig, setStripeConfig] = useState({
    enabled: true,
    mode: 'test',
    publishableKey: 'pk_test_51MzExampleToken0098421',
    secretKey: '••••••••••••••••••••••••••••••••••••••••',
    webhookSecret: 'whsec_••••••••••••••••••••••••',
    currency: 'USD',
  })

  const [paypalConfig, setPaypalConfig] = useState({
    enabled: true,
    mode: 'sandbox',
    clientId: 'AbC_example_paypal_client_id_001',
    secret: '••••••••••••••••••••••••••••••••',
    currency: 'USD',
  })

  const [offlineConfig, setOfflineConfig] = useState({
    enabled: true,
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountName: 'Mentor Learning Technologies Inc.',
    accountNumber: '9842104928174',
    swiftBic: 'CHASUS33XXX',
    instructions: 'Please include your Student Order ID in the wire transfer description. Orders are confirmed within 24 hours of funds clearance.',
  })

  useEffect(() => {
    async function loadGateways() {
      try {
        const res = await fetch('/api/admin/settings/gateways')
        if (res.ok) {
          const data = await res.json()
          if (data.gateways) {
            if (data.gateways.stripe) setStripeConfig(prev => ({ ...prev, ...data.gateways.stripe }))
            if (data.gateways.paypal) setPaypalConfig(prev => ({ ...prev, ...data.gateways.paypal }))
            if (data.gateways.offline) setOfflineConfig(prev => ({ ...prev, ...data.gateways.offline }))
          }
        }
      } catch (err) {
        console.error('Error loading gateway configs:', err)
      }
    }
    loadGateways()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedSuccess(false)

    let currentFields: any = {}
    if (activeGateway === 'stripe') currentFields = stripeConfig
    else if (activeGateway === 'paypal') currentFields = paypalConfig
    else if (activeGateway === 'offline') currentFields = offlineConfig

    try {
      const res = await fetch('/api/admin/settings/gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: activeGateway,
          fields: currentFields
        })
      })
      const data = await res.json()
      if (data.success) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        alert(data.message || 'Failed to update gateway settings.')
      }
    } catch (err) {
      alert('Error updating payment gateway.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Payment Gateways & Merchant Vault</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Secure multi-gateway merchant routing with webhook signature verification across 18 regional methods.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Selection Column */}
          <div className="md:col-span-4 space-y-3">
            {[
              { id: 'stripe', name: 'Stripe Global', desc: 'Credit / Debit cards, Apple Pay, Google Pay', status: 'Active' },
              { id: 'paypal', name: 'PayPal Express', desc: 'Global digital wallet & buyer protection', status: 'Active' },
              { id: 'offline', name: 'Direct Bank Wire (Offline)', desc: 'Custom swift, ACH, and manual slip validation', status: 'Active' },
            ].map((gw) => (
              <Card
                key={gw.id}
                onClick={() => setActiveGateway(gw.id as any)}
                className={`p-4 border-2 cursor-pointer transition-all ${
                  activeGateway === gw.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{gw.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{gw.desc}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    {gw.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Configuration Column */}
          <div className="md:col-span-8">
            <Card className="p-6 border-border bg-card shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-foreground capitalize">
                    {activeGateway} Integration Settings
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure API keys, webhooks, and default transactional currency.
                  </p>
                </div>

                {savedSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Changes Saved!
                  </div>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {activeGateway === 'stripe' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Operational Mode</label>
                      <select
                        value={stripeConfig.mode}
                        onChange={(e) => setStripeConfig({ ...stripeConfig, mode: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg text-xs px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9 font-semibold"
                      >
                        <option value="test">Test / Sandbox Mode</option>
                        <option value="live">Live Production Mode</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Stripe Publishable Key *</label>
                      <Input
                        value={stripeConfig.publishableKey}
                        onChange={(e) => setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Stripe Secret Key *</label>
                      <Input
                        type="password"
                        value={stripeConfig.secretKey}
                        onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Webhook Signing Secret</label>
                      <Input
                        type="password"
                        value={stripeConfig.webhookSecret}
                        onChange={(e) => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                {activeGateway === 'paypal' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Operational Mode</label>
                      <select
                        value={paypalConfig.mode}
                        onChange={(e) => setPaypalConfig({ ...paypalConfig, mode: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg text-xs px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9 font-semibold"
                      >
                        <option value="sandbox">Sandbox Testing</option>
                        <option value="live">Live Production</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">PayPal Client ID *</label>
                      <Input
                        value={paypalConfig.clientId}
                        onChange={(e) => setPaypalConfig({ ...paypalConfig, clientId: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">PayPal Secret *</label>
                      <Input
                        type="password"
                        value={paypalConfig.secret}
                        onChange={(e) => setPaypalConfig({ ...paypalConfig, secret: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                {activeGateway === 'offline' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Bank Institution Name *</label>
                      <Input
                        value={offlineConfig.bankName}
                        onChange={(e) => setOfflineConfig({ ...offlineConfig, bankName: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Account Holder Name *</label>
                      <Input
                        value={offlineConfig.accountName}
                        onChange={(e) => setOfflineConfig({ ...offlineConfig, accountName: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">IBAN / Account Number *</label>
                      <Input
                        value={offlineConfig.accountNumber}
                        onChange={(e) => setOfflineConfig({ ...offlineConfig, accountNumber: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">SWIFT / BIC Code</label>
                      <Input
                        value={offlineConfig.swiftBic}
                        onChange={(e) => setOfflineConfig({ ...offlineConfig, swiftBic: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={isSaving} className="text-xs font-semibold">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving Configuration...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Save Gateway Parameters
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
