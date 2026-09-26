'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, CreditCard, Landmark, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPaymentGatewaysPage() {
  const [activeTab, setActiveTab] = useState('paypal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Gateways config state
  const [configs, setConfigs] = useState<Record<string, any>>({
    paypal: {
      active: true,
      test_mode: true,
      currency: 'USD',
      sandbox_client_id: '',
      sandbox_secret_key: '',
      production_client_id: '',
      production_secret_key: '',
    },
    stripe: {
      active: true,
      test_mode: true,
      currency: 'USD',
      test_public_key: '',
      test_secret_key: '',
      live_public_key: '',
      live_secret_key: '',
      webhook_secret: '',
    },
    razorpay: {
      active: false,
      test_mode: true,
      currency: 'INR',
      api_key: '',
      api_secret: '',
    },
    offline: {
      active: true,
      bank_name: 'JPMorgan Chase Bank, N.A.',
      account_name: 'Mentor LMS Corporation',
      account_number: '9876543210',
      routing_number: '021000021',
      swift_code: 'CHASUS33',
      instructions: 'Please include your Student Order ID in the reference note when transferring funds.',
    },
    mollie: {
      active: false,
      test_mode: true,
      currency: 'EUR',
      test_api_key: '',
      live_api_key: '',
    },
    paystack: {
      active: false,
      test_mode: true,
      currency: 'USD',
      test_public_key: '',
      test_secret_key: '',
      live_public_key: '',
      live_secret_key: '',
    },
    sslcommerz: {
      active: false,
      test_mode: true,
      currency: 'BDT',
      store_id: '',
      store_password: '',
    },
  })

  useEffect(() => {
    async function loadGateways() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/settings/gateways')
        if (res.ok) {
          const data = await res.json()
          if (data.gateways) {
            setConfigs((prev) => ({
              ...prev,
              ...data.gateways,
            }))
          }
        }
      } catch (err) {
        console.error('Error loading gateway configs:', err)
      } finally {
        setLoading(false)
      }
    }
    loadGateways()
  }, [])

  const handleFieldChange = (gateway: string, key: string, value: any) => {
    setConfigs((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [key]: value,
      },
    }))
  }

  const handleSave = async (gatewayKey: string) => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings/gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: gatewayKey,
          fields: configs[gatewayKey] || {},
        }),
      })

      if (res.ok) {
        toast.success(`${gatewayKey.toUpperCase()} configuration saved successfully`)
      } else {
        const err = await res.json()
        toast.error(err.message || 'Failed to update gateway settings')
      }
    } catch {
      toast.error('An error occurred while saving gateway settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Breadcrumbs
        title="Payment Gateways"
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Billing' },
          { title: 'Payment Gateways' },
        ]}
        className="mb-4"
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="bg-card border h-auto p-1.5 gap-1.5 flex flex-wrap sm:flex-nowrap">
                <TabsTrigger value="paypal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  PayPal
                </TabsTrigger>
                <TabsTrigger value="stripe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Stripe
                </TabsTrigger>
                <TabsTrigger value="razorpay" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Razorpay
                </TabsTrigger>
                <TabsTrigger value="offline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Offline Bank
                </TabsTrigger>
                <TabsTrigger value="mollie" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Mollie
                </TabsTrigger>
                <TabsTrigger value="paystack" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Paystack
                </TabsTrigger>
                <TabsTrigger value="sslcommerz" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  SSLCommerz
                </TabsTrigger>
              </TabsList>
            </div>

            {/* PayPal */}
            <TabsContent value="paypal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>PayPal Settings</CardTitle>
                      <CardDescription>Configure standard PayPal checkout and recurring billing</CardDescription>
                    </div>
                    <Badge variant={configs.paypal?.active ? 'default' : 'secondary'}>
                      {configs.paypal?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Enable PayPal</Label>
                        <p className="text-xs text-muted-foreground">Accept payments via PayPal buttons and wallet</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.paypal?.active)}
                        onCheckedChange={(val: boolean) => handleFieldChange('paypal', 'active', val)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Sandbox Test Mode</Label>
                        <p className="text-xs text-muted-foreground">Use developer credentials without real charges</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.paypal?.test_mode)}
                        onCheckedChange={(val: boolean) => handleFieldChange('paypal', 'test_mode', val)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input
                      value={configs.paypal?.currency || 'USD'}
                      onChange={(e) => handleFieldChange('paypal', 'currency', e.target.value)}
                      placeholder="USD"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Sandbox Client ID</Label>
                      <Input
                        value={configs.paypal?.sandbox_client_id || ''}
                        onChange={(e) => handleFieldChange('paypal', 'sandbox_client_id', e.target.value)}
                        placeholder="Sandbox Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sandbox Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.paypal?.sandbox_secret_key || ''}
                        onChange={(e) => handleFieldChange('paypal', 'sandbox_secret_key', e.target.value)}
                        placeholder="Sandbox Secret Key"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Production Client ID</Label>
                      <Input
                        value={configs.paypal?.production_client_id || ''}
                        onChange={(e) => handleFieldChange('paypal', 'production_client_id', e.target.value)}
                        placeholder="Live Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Production Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.paypal?.production_secret_key || ''}
                        onChange={(e) => handleFieldChange('paypal', 'production_secret_key', e.target.value)}
                        placeholder="Live Secret Key"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('paypal')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save PayPal Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stripe */}
            <TabsContent value="stripe">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Stripe Settings</CardTitle>
                      <CardDescription>Configure Stripe Elements credit/debit cards and Apple Pay</CardDescription>
                    </div>
                    <Badge variant={configs.stripe?.active ? 'default' : 'secondary'}>
                      {configs.stripe?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Enable Stripe</Label>
                        <p className="text-xs text-muted-foreground">Accept Visa, Mastercard, AMEX, and digital wallets</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.stripe?.active)}
                        onCheckedChange={(val: boolean) => handleFieldChange('stripe', 'active', val)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Test Mode</Label>
                        <p className="text-xs text-muted-foreground">Process test card transactions</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.stripe?.test_mode)}
                        onCheckedChange={(val: boolean) => handleFieldChange('stripe', 'test_mode', val)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input
                      value={configs.stripe?.currency || 'USD'}
                      onChange={(e) => handleFieldChange('stripe', 'currency', e.target.value)}
                      placeholder="USD"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Test Public Key</Label>
                      <Input
                        value={configs.stripe?.test_public_key || ''}
                        onChange={(e) => handleFieldChange('stripe', 'test_public_key', e.target.value)}
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Test Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.stripe?.test_secret_key || ''}
                        onChange={(e) => handleFieldChange('stripe', 'test_secret_key', e.target.value)}
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Live Public Key</Label>
                      <Input
                        value={configs.stripe?.live_public_key || ''}
                        onChange={(e) => handleFieldChange('stripe', 'live_public_key', e.target.value)}
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Live Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.stripe?.live_secret_key || ''}
                        onChange={(e) => handleFieldChange('stripe', 'live_secret_key', e.target.value)}
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Signing Secret</Label>
                    <Input
                      type="password"
                      value={configs.stripe?.webhook_secret || ''}
                      onChange={(e) => handleFieldChange('stripe', 'webhook_secret', e.target.value)}
                      placeholder="whsec_..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('stripe')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Stripe Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Offline Bank Transfer */}
            <TabsContent value="offline">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Offline Bank Transfer</CardTitle>
                      <CardDescription>Direct deposit / wire transfer details for student manual payments</CardDescription>
                    </div>
                    <Badge variant={configs.offline?.active ? 'default' : 'secondary'}>
                      {configs.offline?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="font-semibold">Enable Offline Bank Transfer</Label>
                      <p className="text-xs text-muted-foreground">Students can submit receipt proof for manual approval</p>
                    </div>
                    <Switch
                      checked={Boolean(configs.offline?.active)}
                      onCheckedChange={(val: boolean) => handleFieldChange('offline', 'active', val)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        value={configs.offline?.bank_name || ''}
                        onChange={(e) => handleFieldChange('offline', 'bank_name', e.target.value)}
                        placeholder="e.g. JPMorgan Chase Bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={configs.offline?.account_name || ''}
                        onChange={(e) => handleFieldChange('offline', 'account_name', e.target.value)}
                        placeholder="e.g. Mentor Learning Technologies Inc."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={configs.offline?.account_number || ''}
                        onChange={(e) => handleFieldChange('offline', 'account_number', e.target.value)}
                        placeholder="Account Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Routing Number</Label>
                      <Input
                        value={configs.offline?.routing_number || ''}
                        onChange={(e) => handleFieldChange('offline', 'routing_number', e.target.value)}
                        placeholder="Routing / Sort Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SWIFT / BIC</Label>
                      <Input
                        value={configs.offline?.swift_code || ''}
                        onChange={(e) => handleFieldChange('offline', 'swift_code', e.target.value)}
                        placeholder="SWIFT Code"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Instructions for Students</Label>
                    <Textarea
                      rows={3}
                      value={configs.offline?.instructions || ''}
                      onChange={(e) => handleFieldChange('offline', 'instructions', e.target.value)}
                      placeholder="Instructions shown on checkout..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('offline')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Offline Bank Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Razorpay */}
            <TabsContent value="razorpay">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Razorpay Settings</CardTitle>
                      <CardDescription>Accept UPI, net banking, and cards in Indian Rupees</CardDescription>
                    </div>
                    <Badge variant={configs.razorpay?.active ? 'default' : 'secondary'}>
                      {configs.razorpay?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Enable Razorpay</Label>
                        <p className="text-xs text-muted-foreground">Accept UPI and Indian debit/credit cards</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.razorpay?.active)}
                        onCheckedChange={(val: boolean) => handleFieldChange('razorpay', 'active', val)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Test Mode</Label>
                        <p className="text-xs text-muted-foreground">Razorpay test environment</p>
                      </div>
                      <Switch
                        checked={Boolean(configs.razorpay?.test_mode)}
                        onCheckedChange={(val: boolean) => handleFieldChange('razorpay', 'test_mode', val)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input
                      value={configs.razorpay?.currency || 'INR'}
                      onChange={(e) => handleFieldChange('razorpay', 'currency', e.target.value)}
                      placeholder="INR"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>API Key ID</Label>
                      <Input
                        value={configs.razorpay?.api_key || ''}
                        onChange={(e) => handleFieldChange('razorpay', 'api_key', e.target.value)}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.razorpay?.api_secret || ''}
                        onChange={(e) => handleFieldChange('razorpay', 'api_secret', e.target.value)}
                        placeholder="Razorpay Secret"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('razorpay')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Razorpay Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mollie */}
            <TabsContent value="mollie">
              <Card>
                <CardHeader>
                  <CardTitle>Mollie Settings</CardTitle>
                  <CardDescription>European payment methods (iDEAL, Bancontact, SOFORT, etc.)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="font-semibold">Enable Mollie</Label>
                      <p className="text-xs text-muted-foreground">Accept European localized payments</p>
                    </div>
                    <Switch
                      checked={Boolean(configs.mollie?.active)}
                      onCheckedChange={(val: boolean) => handleFieldChange('mollie', 'active', val)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test API Key</Label>
                    <Input
                      value={configs.mollie?.test_api_key || ''}
                      onChange={(e) => handleFieldChange('mollie', 'test_api_key', e.target.value)}
                      placeholder="test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Live API Key</Label>
                    <Input
                      type="password"
                      value={configs.mollie?.live_api_key || ''}
                      onChange={(e) => handleFieldChange('mollie', 'live_api_key', e.target.value)}
                      placeholder="live_..."
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('mollie')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Mollie Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paystack */}
            <TabsContent value="paystack">
              <Card>
                <CardHeader>
                  <CardTitle>Paystack Settings</CardTitle>
                  <CardDescription>Accept payments in Africa (Nigeria, Ghana, South Africa, Kenya)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="font-semibold">Enable Paystack</Label>
                      <p className="text-xs text-muted-foreground">Process African mobile money and local cards</p>
                    </div>
                    <Switch
                      checked={Boolean(configs.paystack?.active)}
                      onCheckedChange={(val: boolean) => handleFieldChange('paystack', 'active', val)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <Input
                        value={configs.paystack?.test_public_key || ''}
                        onChange={(e) => handleFieldChange('paystack', 'test_public_key', e.target.value)}
                        placeholder="pk_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        value={configs.paystack?.test_secret_key || ''}
                        onChange={(e) => handleFieldChange('paystack', 'test_secret_key', e.target.value)}
                        placeholder="sk_..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('paystack')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Paystack Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SSLCommerz */}
            <TabsContent value="sslcommerz">
              <Card>
                <CardHeader>
                  <CardTitle>SSLCommerz Settings</CardTitle>
                  <CardDescription>Bangladeshi payment gateway (bKash, Nagad, Rocket, local cards)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="font-semibold">Enable SSLCommerz</Label>
                      <p className="text-xs text-muted-foreground">Accept BDT local currencies and MFS</p>
                    </div>
                    <Switch
                      checked={Boolean(configs.sslcommerz?.active)}
                      onCheckedChange={(val: boolean) => handleFieldChange('sslcommerz', 'active', val)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Store ID</Label>
                      <Input
                        value={configs.sslcommerz?.store_id || ''}
                        onChange={(e) => handleFieldChange('sslcommerz', 'store_id', e.target.value)}
                        placeholder="Store ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Store Password</Label>
                      <Input
                        type="password"
                        value={configs.sslcommerz?.store_password || ''}
                        onChange={(e) => handleFieldChange('sslcommerz', 'store_password', e.target.value)}
                        placeholder="Store Password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => handleSave('sslcommerz')} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save SSLCommerz Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  )
}
